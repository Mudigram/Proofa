import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import {
    segmentAll,
    deduplicateByTopPriority,
    SEGMENTS,
    type CustomerInput,
    type RawEvent,
    type RawDoc,
} from "@/lib/segmentation";

export const dynamic = "force-dynamic";

/** Look-back for behavioural scoring. Beyond this, history still exists but is too
 *  stale to act on marketing-wise, and the payload gets expensive. */
const LOOKBACK_DAYS = 120;
const PAGE_SIZE = 1000;
const MAX_EVENT_ROWS = 60_000;

interface EventRow {
    shadow_id: string | null;
    user_id: string | null;
    event_name: string;
    event_type: string | null;
    properties: Record<string, unknown> | null;
    device: RawEvent["device"] | null;
    created_at: string;
}

/**
 * PostgREST returns at most 1000 rows per request by default. Without paging, an
 * events table of any real size silently returns the first 1000 rows and every
 * segment looks emptier than it is — the most misleading possible failure mode,
 * because it reads like "no opportunity" rather than like an error.
 */
/** Supabase query builders are thenables rather than real Promises, so the
 *  parameter is typed as `PromiseLike` — a `Promise` here rejects valid builders. */
type PagedResult<T> = { data: T[] | null; error: { message: string } | null };

async function fetchPaged<T>(
    build: (from: number, to: number) => PromiseLike<PagedResult<T>>,
    label: string,
): Promise<T[]> {
    const out: T[] = [];
    for (let from = 0; from < MAX_EVENT_ROWS; from += PAGE_SIZE) {
        const { data, error } = await build(from, from + PAGE_SIZE - 1);
        if (error) {
            console.warn(`[segments] ${label} fetch warning:`, error.message);
            break;
        }
        const rows = data ?? [];
        out.push(...rows);
        if (rows.length < PAGE_SIZE) break;
    }
    return out;
}

function toRawEvent(row: EventRow): RawEvent {
    return {
        shadowId: row.shadow_id ?? "unknown",
        userId: row.user_id ?? null,
        eventName: row.event_name,
        eventType: row.event_type ?? "generic",
        properties: row.properties ?? {},
        device: row.device ?? undefined,
        createdAt: row.created_at,
    };
}

export async function POST(req: Request) {
    try {
        const auth = await requireAdmin(req);
        if (!auth.ok) return auth.response;

        const body = await req.json().catch(() => ({} as { segment?: string; includeCustomers?: boolean; channelFilter?: string }));
        const includeCustomers = body.includeCustomers !== false;
        const now = new Date();
        const sinceIso = new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000).toISOString();

        // ── 1. Pull the raw layers ────────────────────────────────────────────
        const [profilesRes, authUsersRes, docRowsRaw, shadowRowsRaw] = await Promise.all([
            supabaseAdmin.from("profiles").select("*"),
            supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
            fetchPaged<{ id: string; owner_id: string | null; type: string; amount: number; currency: string | null; created_at: string; deleted_at: string | null }>(
                (f, t) => supabaseAdmin
                    .from("documents")
                    .select("id, owner_id, type, amount, currency, created_at, deleted_at")
                    .gte("created_at", sinceIso)
                    .range(f, t),
                "documents",
            ),
            fetchPaged<Record<string, unknown>>(
                (f, t) => supabaseAdmin.from("shadow_profiles").select("*").range(f, t),
                "shadow_profiles",
            ),
        ]);

        const events = await fetchPaged<EventRow>(
            (f, t) => supabaseAdmin
                .from("telemetry_events")
                .select("shadow_id, user_id, event_name, event_type, properties, device, created_at")
                .gte("created_at", sinceIso)
                .order("created_at", { ascending: false })
                .range(f, t),
            "telemetry_events",
        );

        const profiles: any[] = profilesRes.data ?? [];
        const authUsers: any[] = authUsersRes.data?.users ?? [];
        const docsRows = docRowsRaw;
        const shadows: any[] = shadowRowsRaw;

        if (profilesRes.error) console.warn("[segments] profiles warning:", profilesRes.error.message);

        // ── 2. Identity resolution ───────────────────────────────────────────
        // Shadow history must follow the user across authentication, otherwise
        // every merchant looks like a brand-new signup on the day they register and
        // activation reads wrong for the entire base.
        const shadowIdsByUser = new Map<string, string[]>();
        for (const sp of shadows) {
            if (!sp.user_id || !sp.id) continue;
            const list = shadowIdsByUser.get(sp.user_id) ?? [];
            list.push(String(sp.id));
            shadowIdsByUser.set(sp.user_id, list);
        }

        const rawEvents = events.map(toRawEvent);

        const eventsByUserKey = new Map<string, RawEvent[]>();
        const claimedShadowIds = new Set<string>();
        for (const ev of rawEvents) {
            const uid = ev.userId;
            if (uid) {
                const arr = eventsByUserKey.get(uid) ?? [];
                arr.push(ev);
                eventsByUserKey.set(uid, arr);
            }
        }
        // Fold anonymous-history events into the authenticated customer they resolved to.
        for (const [uid, shadowIds] of shadowIdsByUser) {
            for (const sid of shadowIds) {
                claimedShadowIds.add(sid);
                for (const ev of rawEvents) {
                    if (ev.shadowId === sid && !ev.userId) {
                        const arr = eventsByUserKey.get(uid) ?? [];
                        arr.push(ev);
                        eventsByUserKey.set(uid, arr);
                    }
                }
            }
        }

        const docsByOwner = new Map<string, RawDoc[]>();
        for (const d of docsRows) {
            if (d.deleted_at || !d.owner_id) continue;
            const arr = docsByOwner.get(d.owner_id) ?? [];
            arr.push({
                ownerId: d.owner_id,
                type: String(d.type ?? "receipt"),
                amount: Number(d.amount) || 0,
                currency: String(d.currency ?? "NGN"),
                createdAt: d.created_at,
            });
            docsByOwner.set(d.owner_id, arr);
        }

        // ── 3. Build one CustomerInput per resolved identity ──────────────────
        const inputs: CustomerInput[] = [];
        const seenUsers = new Set<string>();

        const profileByAuthId = new Map<string, any>();
        for (const p of profiles) profileByAuthId.set(p.id, p);

        for (const u of authUsers) {
            const uid = String(u.id);
            seenUsers.add(uid);
            const profile = profileByAuthId.get(uid) ?? {};
            inputs.push({
                identity: {
                    key: uid,
                    kind: "authenticated",
                    userId: uid,
                    shadowId: (shadowIdsByUser.get(uid) ?? [null])[0],
                    plan: String(profile.subscription_plan ?? "free"),
                    subscriptionStatus: profile.subscription_status ?? null,
                    email: u.email ?? profile.email ?? null,
                    phone: profile.phone ?? profile.contact_phone ?? u.phone ?? null,
                    businessName: profile.business_name ?? profile.full_name ?? null,
                    createdAt: u.created_at ?? profile.created_at ?? null,
                },
                events: eventsByUserKey.get(uid) ?? [],
                docs: docsByOwner.get(uid) ?? [],
            });
        }

        // Profiles without a matching auth user (deleted auth rows, imported rows).
        for (const p of profiles) {
            const uid = String(p.id);
            if (seenUsers.has(uid)) continue;
            seenUsers.add(uid);
            inputs.push({
                identity: {
                    key: uid,
                    kind: "authenticated",
                    userId: uid,
                    shadowId: (shadowIdsByUser.get(uid) ?? [null])[0],
                    plan: String(p.subscription_plan ?? "free"),
                    subscriptionStatus: p.subscription_status ?? null,
                    email: p.email ?? null,
                    phone: p.phone ?? p.contact_phone ?? null,
                    businessName: p.business_name ?? p.full_name ?? null,
                    createdAt: p.created_at ?? null,
                },
                events: eventsByUserKey.get(uid) ?? [],
                docs: docsByOwner.get(uid) ?? [],
            });
        }

        for (const sp of shadows) {
            if (sp.user_id) continue; // already folded into the authenticated customer
            if (!sp.id) continue;
            inputs.push({
                identity: {
                    key: String(sp.id),
                    kind: "anonymous",
                    userId: null,
                    shadowId: String(sp.id),
                    plan: "free",
                    email: sp.contact_email ?? null,
                    phone: sp.contact_phone ?? null,
                    businessName: sp.business_name ?? null,
                    createdAt: sp.first_seen_at ?? null,
                    referredBy: sp.referred_by_shadow_id ?? null,
                    referralSource: sp.referral_source ?? null,
                },
                events: rawEvents.filter((e) => e.shadowId === sp.id),
                docs: [],
            });
        }

        // ── 4. Score and segment ─────────────────────────────────────────────
        const report = segmentAll(inputs, now);
        const exclusive = deduplicateByTopPriority(report);

        const segments = report.segments.map((s) => ({
            ...s,
            /** Customers whose TOP-ranked segment is this one — the actual send list. */
            exclusiveCount: (exclusive.get(s.id) ?? []).length,
        }));

        const filter = typeof body.segment === "string" && body.segment ? body.segment : null;
        const customers = includeCustomers
            ? (filter ? report.customers.filter((c) => c.segments.some((s) => s.id === filter)) : report.customers)
            : [];

        return NextResponse.json({
            success: true,
            generatedAt: report.generatedAt,
            lookbackDays: LOOKBACK_DAYS,
            /** Set when the event scan hit the row cap — counts are then a floor, not a total. */
            truncated: events.length >= MAX_EVENT_ROWS,
            population: report.population,
            stageCounts: report.stageCounts,
            unassignedCount: report.unassignedCount,
            segments,
            segmentDefinitions: SEGMENTS.map((s) => ({ id: s.id, name: s.name, skill: s.skill, channel: s.channel, priority: s.priority })),
            exclusiveLists: Object.fromEntries([...exclusive.entries()]),
            customers,
        });
    } catch (error: any) {
        console.error("[segments] server error:", error);
        return NextResponse.json({ error: "Internal server error", details: error?.message }, { status: 500 });
    }
}