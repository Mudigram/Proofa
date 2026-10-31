/**
 * lib/segmentation/events.ts
 *
 * Canonical event taxonomy. Existing names in `lib/telemetry.ts` are preserved so
 * historical `telemetry_events` rows keep scoring; new names are additive and are
 * what closes the "I can't see what my Pro users do" gap.
 */

/** Event names. Values are what gets written to `telemetry_events.event_name`. */
export const EVENTS = {
    // ── Live today ────────────────────────────────────────────────────────────
    DOC_EXPORTED: "doc_exported",
    FEATURE_INTENT: "feature_intent",
    UPGRADE_GATE_VIEWED: "upgrade_gate_viewed",
    SESSION_PING: "session_ping",

    // ── Additive: authenticated / Pro behaviour (the blind spot) ──────────────
    DOC_DRAFTED: "doc_drafted",
    DOC_VIEWED: "doc_viewed",
    PRO_FEATURE_USED: "pro_feature_used",
    PRO_FEATURE_BLOCKED: "pro_feature_blocked",
    HISTORY_OPENED: "history_opened",
    TEMPLATE_CHANGED: "template_changed",
    SHARE_CHANNEL_USED: "share_channel_used",
    STATUS_SHARED: "status_shared",
    PWA_INSTALLED: "pwa_installed",
    ACCOUNT_UPGRADED: "account_upgraded",
    SUBSCRIPTION_CHANGED: "subscription_changed",
    PAYMENT_FAILED: "payment_failed",
    REFERRAL_LANDING_VIEWED: "referral_landing_viewed",
    REFERRED_SIGNUP: "referred_signup",
    REFERRED_ACTIVATED: "referred_activated",
    OPT_OUT: "opt_out",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/**
 * Pro / Business gated features.
 *
 * `pro_feature_intent` = touched the control while gated (a desire signal).
 * `pro_feature_used`   = actually used it, i.e. already getting Pro value.
 * The second is what is missing today and is what makes Pro users legible.
 */
export const PRO_FEATURES = [
    "logo_upload",
    "custom_color",
    "classic_template",
    "currency_toggle",
    "pdf_export",
    "cloud_history",
    "bank_vault",
    "whatsapp_direct",
    "remove_watermark",
    "bulk_documents",
    "customer_directory",
    "quick_replies",
    "team_members",
    "business_reports",
] as const;

export type ProFeature = (typeof PRO_FEATURES)[number];

/** Which gated features actually indicate willingness to pay, and how strongly. */
export const INTENT_WEIGHTS: Record<string, number> = {
    logo_upload: 14,
    custom_color: 10,
    classic_template: 9,
    remove_watermark: 16,
    pdf_export: 15,
    cloud_history: 12,
    currency_toggle: 13,
    bank_vault: 11,
    whatsapp_direct: 7,
    bulk_documents: 14,
    customer_directory: 10,
    quick_replies: 8,
    team_members: 12,
    business_reports: 9,
};

/** Upgrade-gate variants from PRO_PLAN.md's trigger map. */
export const GATE_VARIANTS = {
    EXPORT: "export",
    LOGO: "logo",
    COLOR: "color",
    POST_ACCOUNT: "post_account",
    HISTORY: "history",
} as const;

/**
 * Objection class per gate variant. A gate view is not a rejection — it is a live
 * objection, and *which* objection depends on where it fired.
 */
export const GATE_OBJECTION: Record<string, "value" | "identity" | "loss-aversion" | "price"> = {
    [GATE_VARIANTS.EXPORT]: "value",
    [GATE_VARIANTS.LOGO]: "identity",
    [GATE_VARIANTS.COLOR]: "identity",
    [GATE_VARIANTS.POST_ACCOUNT]: "value",
    [GATE_VARIANTS.HISTORY]: "loss-aversion",
};

const EXPORT_EVENTS = new Set<string>([EVENTS.DOC_EXPORTED]);
const SESSION_EVENTS = new Set<string>([EVENTS.SESSION_PING, EVENTS.DOC_VIEWED, EVENTS.DOC_DRAFTED, EVENTS.HISTORY_OPENED]);

export function isExportEvent(name: string): boolean {
    return EXPORT_EVENTS.has(name);
}

export function isSessionEvent(name: string): boolean {
    return SESSION_EVENTS.has(name);
}

/** Reads `properties.docType` defensively — jsonb shapes drift. */
export function eventDocType(event: { properties?: Record<string, unknown> }): "receipt" | "invoice" | "order" {
    const raw = String(event.properties?.docType ?? "receipt").toLowerCase();
    if (raw.includes("invoice")) return "invoice";
    if (raw.includes("order")) return "order";
    return "receipt";
}

export function eventAmount(event: { properties?: Record<string, unknown> }): number {
    const n = Number(event.properties?.amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

export function eventCurrency(event: { properties?: Record<string, unknown> }): "NGN" | "USD" {
    return String(event.properties?.currency ?? "NGN").toUpperCase() === "USD" ? "USD" : "NGN";
}

export function eventFeature(event: { properties?: Record<string, unknown> }): string | null {
    const f = event.properties?.feature ?? event.properties?.proFeature;
    return typeof f === "string" && f.length > 0 ? f : null;
}

export function eventGateVariant(event: { properties?: Record<string, unknown> }): string | null {
    const v = event.properties?.variant ?? event.properties?.gate;
    return typeof v === "string" && v.length > 0 ? v : null;
}