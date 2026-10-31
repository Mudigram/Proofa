import { NextResponse } from "next/server";

/**
 * Shared admin authentication.
 *
 * WHY THIS EXISTS
 * Every `/api/admin/*` route previously did:
 *
 *     const validKey = process.env.ADMIN_SECRET_KEY || "proofa_hq_2026";
 *
 * A hardcoded fallback secret that ships in the repository is not a secret. Those
 * routes return every user email, phone number, business name and document volume,
 * so anyone who reads the repo (or guesses the pattern) can bulk-export customer
 * PII by sending the literal string `proofa_hq_2026`.
 *
 * This helper fails CLOSED: no configured secret means no access, and it says so
 * loudly in the server log rather than silently accepting a default.
 *
 * ── MIGRATION NOTE ───────────────────────────────────────────────────────────
 * Set `ADMIN_SECRET_KEY` in your deployment environment before deploying this.
 * Until it is set, every admin endpoint returns 503 with an explanation. If you
 * need the previous behaviour temporarily while you rotate, set
 * `ADMIN_ALLOW_LEGACY_KEY="true"` — that re-enables the old shared string so you
 * are not locked out, and logs a warning each request. Remove it once rotated.
 */

const LEGACY_KEY = "proofa_hq_2026";

function legacyAllowed(): boolean {
    return process.env.ADMIN_ALLOW_LEGACY_KEY === "true";
}

/**
 * Validate the admin key from the `x-admin-key` header or an `adminKey` body field.
 *
 * Returns the validated key on success, or a `NextResponse` to return immediately.
 * Callers must return the response when it is non-null — never proceed past it.
 */
export async function requireAdmin(
    req: Request,
): Promise<{ ok: true; key: string } | { ok: false; response: NextResponse }> {
    const configured = (process.env.ADMIN_SECRET_KEY ?? "").trim();
    const fallbackInUse = !configured && legacyAllowed();

    if (!configured && !legacyAllowed()) {
        console.error(
            "[admin-auth] ADMIN_SECRET_KEY is not set. Refusing access. " +
            "Set it in your environment, or set ADMIN_ALLOW_LEGACY_KEY=\"true\" as a " +
            "temporary measure while you rotate keys.",
        );
        return {
            ok: false,
            response: NextResponse.json(
                { error: "Admin access is not configured on this deployment." },
                { status: 503 },
            ),
        };
    }

    let candidate = req.headers.get("x-admin-key") ?? "";
    if (!candidate) {
        // Body fallback keeps the existing client contract intact. Cloned because
        // callers go on to read the body themselves.
        try {
            const body = await req.clone().json();
            candidate = typeof body?.adminKey === "string" ? body.adminKey : "";
        } catch {
            candidate = "";
        }
    }
    candidate = candidate.trim();

    const accepted = configured
        ? constantTimeEquals(candidate, configured)
        : candidate === LEGACY_KEY;

    if (!candidate || !accepted) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Unauthorized: Invalid admin key" }, { status: 401 }),
        };
    }

    if (fallbackInUse) {
        console.warn(
            "[admin-auth] Using the legacy shared admin key. Set ADMIN_SECRET_KEY and " +
            "unset ADMIN_ALLOW_LEGACY_KEY as soon as possible.",
        );
    }

    return { ok: true, key: candidate };
}

/**
 * Length-compared, byte-compared without early exit on mismatch. Timing-safe enough
 * for this use: the goal is not leaking a match position to an unauthenticated
 * caller, and Node's `crypto.timingSafeEqual` requires equal-length buffers.
 */
function constantTimeEquals(a: string, b: string): boolean {
    const enc = new TextEncoder();
    const ab = enc.encode(a);
    const bb = enc.encode(b);
    if (ab.length !== bb.length) return false;
    let diff = 0;
    for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
    return diff === 0;
}