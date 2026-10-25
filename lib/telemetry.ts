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
                        businessAddress: parsed.businessAddress || null,
                        bankName: parsed.bankDetails?.bankName || null,
                        accountNumber: parsed.bankDetails?.accountNumber || null,
                    };
                }
            } catch {}
        }

        const payload: TelemetryPayload = {
            shadowId,
            userId,
            eventType: eventName.startsWith("gate_")
                ? "upgrade_gate_viewed"
                : eventName === "session_ping"
                ? "session_ping"
                : "feature_intent",
            eventName,
            properties,
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

    const contactPhone = normalizePhoneNumber(params.customerPhone);

    const merchantProfile = {
        businessName: params.businessName || null,
        contactPhone: contactPhone,
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
