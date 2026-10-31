/**
 * lib/telemetry.ts
 *
 * Anonymous Shadow Tracking & Telemetry Engine.
 * Passively identifies guest and free users, tracks document volume,
 * extracts merchant identity signals, and captures feature intent for targeted marketing.
 */

export interface TelemetryPayload {
    shadowId: string;
    userId?: string | null;
    eventType: "doc_exported" | "feature_intent" | "upgrade_gate_viewed" | "session_ping";
    eventName: string;
    properties?: Record<string, any>;
    merchantProfile?: {
        businessName?: string | null;
        contactPhone?: string | null;
        contactEmail?: string | null;
        businessAddress?: string | null;
        bankName?: string | null;
        accountNumber?: string | null;
    };
    device?: {
        platform: string;
        isMobile: boolean;
        isPWA: boolean;
        isInAppWebview: boolean;
    };
    timestamp: string;
}

const SHADOW_ID_KEY = "proofa_shadow_id";

/**
 * Returns a persistent anonymous device / merchant identifier.
 * Stored in localStorage so it persists across sessions.
 */
export function getOrCreateShadowId(): string {
    if (typeof window === "undefined") return "server";
    try {
        let shadowId = localStorage.getItem(SHADOW_ID_KEY);
        if (!shadowId) {
            shadowId = "shw_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
            localStorage.setItem(SHADOW_ID_KEY, shadowId);
        }
        return shadowId;
    } catch {
        return "shw_fallback_" + Date.now();
    }
}

/**
 * Detects current device environment.
 */
export function getDeviceInfo() {
    if (typeof window === "undefined") {
        return { platform: "server", isMobile: false, isPWA: false, isInAppWebview: false };
    }

    const ua = navigator.userAgent || "";
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
    const platform = /iphone|ipad|ipod/i.test(ua)
        ? "iOS"
        : /android/i.test(ua)
        ? "Android"
        : "Desktop";

    const isPWA = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    const isInAppWebview = /instagram|whatsapp|fban|fbav|tiktok|twitter/i.test(ua);

    return { platform, isMobile, isPWA, isInAppWebview };
}

/**
 * Normalizes Nigerian phone numbers to international format (234...)
 */
export function normalizePhoneNumber(phone?: string | null): string | null {
    if (!phone) return null;
    const clean = String(phone).replace(/\D/g, "");
    if (clean.length === 11 && clean.startsWith("0")) return `234${clean.slice(1)}`;
    if (clean.length === 10) return `234${clean}`;
    if (clean.length >= 12 && clean.startsWith("234")) return clean;
    return clean.length >= 10 ? clean : null;
}

/**
 * Intelligently extracts the TRUE MERCHANT WhatsApp/phone number.
 * 1. Checks explicit merchant/business phone.
 * 2. Checks saved guest business profile in localStorage.
 * 3. Checks logged in user's profile phone.
 * 4. Smart Nigerian Fintech detection: If bank is OPay, PalmPay, Moniepoint, or Kuda,
 *    the 10-digit account number IS their 11-digit phone number!
 */
export function extractMerchantPhone(params?: {
    businessPhone?: string | null;
    userPhone?: string | null;
    bankDetails?: { bankName?: string; accountNumber?: string };
}): string | null {
    if (params?.businessPhone) {
        const norm = normalizePhoneNumber(params.businessPhone);
        if (norm) return norm;
    }

    if (params?.userPhone) {
        const norm = normalizePhoneNumber(params.userPhone);
        if (norm) return norm;
    }

    if (typeof window !== "undefined") {
        try {
            const guestBiz = localStorage.getItem("proofa_guest_biz_profile");
            if (guestBiz) {
                const parsed = JSON.parse(guestBiz);
                if (parsed.businessPhone) {
                    const norm = normalizePhoneNumber(parsed.businessPhone);
                    if (norm) return norm;
                }
            }
        } catch {}
    }

    // Nigerian Fintech phone-as-account-number detection
    if (params?.bankDetails?.bankName && params?.bankDetails?.accountNumber) {
        const bank = params.bankDetails.bankName.toLowerCase();
        const acc = params.bankDetails.accountNumber.replace(/\D/g, "");
        if (
            bank.includes("opay") ||
            bank.includes("palmpay") ||
            bank.includes("moniepoint") ||
            bank.includes("kuda")
        ) {
            if (acc.length === 10) return `234${acc}`;
            if (acc.length === 11 && acc.startsWith("0")) return `234${acc.slice(1)}`;
        }
    }

    return null;
}

/**
 * Maps an event name onto the coarse `event_type` column.
 *
 * The segmentation engine keys off `event_name`, so this is only for human
 * browsing of the raw table — but lumping every new event into `feature_intent`
 * would make the table unreadable for anyone querying it directly.
 */
function deriveEventType(eventName: string): TelemetryPayload["eventType"] {
    switch (eventName) {
        case "doc_exported":
            return "doc_exported";
        case "session_ping":
        case "doc_viewed":
        case "doc_drafted":
        case "history_opened":
            return "session_ping";
        case "upgrade_gate_viewed":
            return "upgrade_gate_viewed";
        default:
            return "feature_intent";
    }
}

/**
 * Core asynchronous non-blocking event dispatcher.
 * Uses keepalive: true so events complete even if the user closes or navigates.
 */
export async function trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    merchantData?: TelemetryPayload["merchantProfile"]
) {
    if (typeof window === "undefined") return;

    try {
        const shadowId = getOrCreateShadowId();
        let userId: string | null = null;

        try {
            const cachedUser = localStorage.getItem("proofa_cached_profile");
            if (cachedUser) {
                const parsed = JSON.parse(cachedUser);
                userId = parsed.id || null;
            }
        } catch {}

        // Extract merchant profile defaults if not provided
        let resolvedMerchant = merchantData;
        if (!resolvedMerchant) {
            try {
                const guestBiz = localStorage.getItem("proofa_guest_biz_profile");
                if (guestBiz) {
                    const parsed = JSON.parse(guestBiz);
                    resolvedMerchant = {
                        businessName: parsed.businessName || null,
                        contactPhone: normalizePhoneNumber(parsed.businessPhone) || null,
                        businessAddress: parsed.businessAddress || null,
                        bankName: parsed.bankDetails?.bankName || null,
                        accountNumber: parsed.bankDetails?.accountNumber || null,
                    };
                }
            } catch {}
        }

        const referral = getReferralSource();
        const mergedProperties = referral
            ? { ...properties, _ref: { src: referral.src, sid: referral.sid, dt: referral.dt } }
            : properties;

        const payload: TelemetryPayload = {
            shadowId,
            userId,
            eventType: deriveEventType(eventName),
            eventName,
            properties: mergedProperties,
            merchantProfile: resolvedMerchant,
            device: getDeviceInfo(),
            timestamp: new Date().toISOString(),
        };

        const json = JSON.stringify(payload);

        // Try sendBeacon if available, otherwise fetch with keepalive
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            const blob = new Blob([json], { type: "application/json" });
            const sent = navigator.sendBeacon("/api/telemetry/event", blob);
            if (sent) return;
        }

        fetch("/api/telemetry/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: json,
            keepalive: true,
        }).catch(() => {
            // Non-blocking fire-and-forget
        });
    } catch {
        // Fail silently so user experience is never impacted
    }
}

/**
 * Helper specifically for tracking completed document exports (Receipts, Invoices, Orders).
 */
export function trackDocExport(params: {
    docType: string;
    amount: number;
    currency: string;
    template: string;
    businessName?: string | null;
    businessPhone?: string | null;
    userPhone?: string | null;
    customerPhone?: string | null;
    customerName?: string | null;
    items?: Array<{ name: string; price?: number; quantity?: number }>;
    bankDetails?: {
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
        enabled?: boolean;
    };
}) {
    const topKeywords: string[] = [];
    if (Array.isArray(params.items)) {
        params.items.forEach(item => {
            if (item.name && item.name.trim()) {
                topKeywords.push(item.name.trim().slice(0, 40));
            }
        });
    }

    // Resolve the true vendor/merchant WhatsApp number
    const merchantPhone = extractMerchantPhone({
        businessPhone: params.businessPhone,
        userPhone: params.userPhone,
        bankDetails: params.bankDetails,
    });

    const customerPhone = normalizePhoneNumber(params.customerPhone);

    const merchantProfile = {
        businessName: params.businessName || null,
        contactPhone: merchantPhone, // TRUE MERCHANT PHONE ONLY (NEVER the buyer's phone)
        bankName: params.bankDetails?.bankName || null,
        accountNumber: params.bankDetails?.accountNumber || null,
    };

    trackEvent(
        "doc_exported",
        {
            docType: params.docType,
            amount: params.amount,
            currency: params.currency || "NGN",
            template: params.template,
            itemCount: params.items?.length || 1,
            topItems: topKeywords.slice(0, 5),
            hasBankDetails: Boolean(params.bankDetails?.bankName && params.bankDetails?.enabled),
            customerName: params.customerName || null,
            customerPhone: customerPhone || null, // Buyer phone stored in event properties
        },
        merchantProfile
    );
}

/**
 * Helper for logging high-intent feature interactions.
 */
export function trackFeatureIntent(
    feature: "logo_upload" | "custom_color" | "currency_toggle" | "classic_template" | "bank_vault" | "whatsapp_direct",
    details: Record<string, any> = {}
) {
    trackEvent("feature_intent", {
        feature,
        ...details,
    });
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Authenticated / Pro behaviour.
 *
 * Guests were always tracked richly; paying customers were reduced to a document
 * count, which is why "what is my Pro base actually doing" was unanswerable.
 * These helpers close that gap with the same fidelity as guest tracking.
 *
 * Two distinct signals, deliberately kept apart:
 *   trackProFeatureBlocked → touched a control the plan does not include (DESIRE)
 *   trackProFeatureUsed    → actually used a paid feature (GETTING VALUE)
 * Collapsing them makes it impossible to tell an unconverted prospect from a
 * paying customer who is quietly not using what they bought.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function trackProFeatureUsed(feature: string, details: Record<string, any> = {}) {
    trackEvent("pro_feature_used", { feature, ...details });
}

export function trackProFeatureBlocked(feature: string, details: Record<string, any> = {}) {
    trackEvent("pro_feature_blocked", { feature, ...details });
}

/**
 * `variant` drives objection routing downstream: an export limit reads as a value
 * objection, a logo gate as an identity objection, a history gate as loss aversion.
 * Same offer, different first line.
 */
export function trackUpgradeGate(
    variant: "export" | "logo" | "color" | "post_account" | "history" | string,
    details: Record<string, any> = {},
) {
    trackEvent("upgrade_gate_viewed", { variant, ...details });
}

export function trackDocDrafted(docType: string, itemCount = 0) {
    trackEvent("doc_drafted", { docType, itemCount });
}

export function trackHistoryOpened(resultCount: number) {
    trackEvent("history_opened", { resultCount });
}

export function trackTemplateChanged(template: string) {
    trackEvent("template_changed", { template });
}

export function trackShareChannel(channel: "whatsapp" | "status" | "copy" | "download" | "print" | string) {
    trackEvent("share_channel_used", { channel });
}

/** Merchant pushed their own receipt to WhatsApp Status — a strong loyalty signal. */
export function trackStatusShared(docType: string) {
    trackEvent("status_shared", { docType });
}

export function trackPwaInstalled() {
    trackEvent("pwa_installed", {});
}

export function trackAccountUpgraded(plan: string) {
    trackEvent("account_upgraded", { plan });
}

export function trackPaymentFailed(reason?: string) {
    trackEvent("payment_failed", { reason: reason ?? "unknown" });
}

const REFERRAL_KEY = "proofa_referral";

/**
 * Captures loop attribution (`?src=receipt&sid=...`) once, on first sight, and
 * persists it. Write-once matters: if a later organic visit overwrote the source,
 * the referral loop would always appear to have produced nothing.
 *
 * Never put a phone number, account number or buyer detail in the link — URLs leak
 * through history, server logs and screenshots.
 */
export function captureReferralSource(): { src: string; sid: string; dt: string | null } | null {
    if (typeof window === "undefined") return null;
    try {
        const url = new URL(window.location.href);
        const src = url.searchParams.get("src");
        const sid = url.searchParams.get("sid");
        if (!src || !sid) return getReferralSource();

        const record = { src, sid, dt: url.searchParams.get("dt"), at: Date.now() };
        localStorage.setItem(REFERRAL_KEY, JSON.stringify(record));

        // Strip the params so a shared or bookmarked URL does not re-attribute.
        url.searchParams.delete("src");
        url.searchParams.delete("sid");
        url.searchParams.delete("dt");
        window.history.replaceState({}, "", url.pathname + (url.search || "") + url.hash);

        void trackEvent("referral_landing_viewed", { src, sid, dt: record.dt });
        return { src: record.src, sid: record.sid, dt: record.dt };
    } catch {
        return null;
    }
}

export function getReferralSource(): { src: string; sid: string; dt: string | null } | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(REFERRAL_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.src || !parsed?.sid) return null;
        return { src: parsed.src, sid: parsed.sid, dt: parsed.dt ?? null };
    } catch {
        return null;
    }
}
