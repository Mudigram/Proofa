/**
 * lib/segmentation/types.ts
 *
 * Behavioural segmentation model for Proofa.
 *
 * Five layers, each dependent on the one below (see customer-segmentation skill):
 *   identity → events → attributes → scores → segments
 *
 * DESIGN CONSTRAINTS
 * - This module is pure. No Supabase, no Next, no I/O. Inputs are plain records,
 *   outputs are plain records, so scoring can be unit-tested and re-run over
 *   history without a database.
 * - Events are facts; scores are opinions. Never write an opinion into the stream.
 * - Attributes are windowed and recomputable. Nothing here is append-only state.
 */

/** Peak merchant availability band, Africa/Lagos (UTC+1) derived from event times. */
export type PeakHourBand = "early-morning" | "midday" | "evening" | "late-night" | "weekend";

/** The channel a merchant can actually be reached on, strongest first. */
export type ContactChannel = "whatsapp" | "email" | "none";

/**
 * Where a play is delivered. Wider than `ContactChannel` because the best play is
 * often in-product, which requires no contact at all — and no consent problem.
 */
export type DistributionChannel = ContactChannel | "in-product";

/** Primary lifecycle stage. Exactly one is assigned per customer. */
export type LifecycleStage =
    | "visitor"          // sessions, never exported a document
    | "first-win"        // exactly one export — most fragile moment
    | "forming"          // 2–4 exports, habit not yet set
    | "regular"          // habitual exporter
    | "committed"        // high tenure + volume, or paying
    | "dormant"          // quiet beyond own norm, recoverable
    | "lost"             // quiet beyond the recovery window
    | "at-risk-paid"     // paying and disengaging
    | "paying";          // paying and healthy

/** Classic RFM buckets, named as the industry convention. */
export type RfmBucket =
    | "champions"
    | "loyal"
    | "promising"
    | "needs-attention"
    | "about-to-churn"
    | "can't-lose-them"
    | "hibernating"
    | "lost"
    | "new"
    | "no-activity";

export type IdentityKind = "authenticated" | "anonymous";

/** One raw row from `telemetry_events`, normalised to camelCase. */
export interface RawEvent {
    shadowId: string;
    userId: string | null;
    eventName: string;
    eventType?: string;
    properties?: Record<string, unknown>;
    device?: {
        platform?: string;
        isMobile?: boolean;
        isPWA?: boolean;
        isInAppWebview?: boolean;
    };
    createdAt: string;
}

/** One raw row from `documents`. */
export interface RawDoc {
    ownerId: string | null;
    type: string;
    amount: number;
    currency: string;
    createdAt: string;
    deletedAt?: string | null;
}

/** Identity resolution result: one human, one record. */
export interface IdentityInput {
    /** Merge key — `user_id` when authenticated, otherwise `shadow_id`. */
    key: string;
    kind: IdentityKind;
    userId: string | null;
    shadowId: string | null;
    plan: string;
    subscriptionStatus?: string | null;
    email?: string | null;
    phone?: string | null;
    businessName?: string | null;
    /** Account creation, when known. Falls back to first event. */
    createdAt?: string | null;
    /** Attribution, immutable once set. See whatsapp-growth loop-mechanics. */
    referredBy?: string | null;
    referralSource?: string | null;
}

/** Everything the engine needs for one customer. */
export interface CustomerInput {
    identity: IdentityInput;
    /** Raw events for this identity, including inherited anonymous history. */
    events: RawEvent[];
    /** Documents owned by this identity. */
    docs: RawDoc[];
}

/** Population stats used to calibrate relative scores. */
export interface PopulationStats {
    /** Median exports per active customer over 30d. */
    medianExports30d: number;
    /** Median Naira document value; anchors "big ticket" vs "high turnover". */
    medianDocValue: number;
    totalCustomers: number;
    payingCustomers: number;
}

export interface EvalContext {
    /** Injected for determinism in tests. */
    now: Date;
    population?: PopulationStats;
}

/** Layer 3 — windowed, recomputable facts about a customer. */
export interface CustomerAttributes {
    // Recency
    daysSinceLast: number | null;
    daysSinceFirst: number | null;
    tenureDays: number;
    /** Median gap between activity days, in days. The customer's own natural cadence. */
    medianActivityGapDays: number | null;

    // Frequency
    sessions30d: number;
    activityDays30d: number;
    exports7d: number;
    exports30d: number;
    exports90d: number;
    exportsLifetime: number;
    receiptCount: number;
    invoiceCount: number;
    orderCount: number;
    receiptShare: number;

    // Value (Naira unless suffixed)
    volume30d: number;
    volume90d: number;
    volumeLifetime: number;
    docsUsd90d: number;
    avgDocValue: number;

    // Intent
    paywallViews7d: number;
    paywallViewsLifetime: number;
    proFeatureTaps30d: number;
    proFeatureTapsLifetime: number;
    logoTaps30d: number;
    gateVariants: string[];
    proFeaturesUsed: string[];

    // Activation
    secondExportWithin7d: boolean;
    pwaInstalled: boolean;
    bankDetailsSaved: boolean;

    // Channel
    platform: string;
    inAppWebview: boolean;
    peakHourBand: PeakHourBand | null;
    weekendActivity: boolean;
    contactable: ContactChannel;

    // Payment health
    paymentFailed: boolean;
}

/** Layer 4 — comparable judgements. Opinions, never written back to events. */
export interface CustomerScores {
    recency: number;
    frequency: number;
    monetary: number;
    /** Sum of R+F+M, range 3–15. */
    rfm: number;
    rfmBucket: RfmBucket;
    /** 0–100 habit strength measured against the customer's OWN cadence. */
    engagement: number;
    /** 0–100 likelihood of paying soon. */
    purchaseIntent: number;
    /** 0–100, paying customers only. `null` for free/anonymous. */
    health: number | null;
    churnRisk: "low" | "medium" | "high" | null;
}

/** A resolved segment membership. */
export interface SegmentHit {
    id: string;
    name: string;
    /** Why this segment matters — surfaced in the admin console. */
    rationale: string;
    play: string;
    /** Downstream skill that executes the play, e.g. `paywalls`, `cold-email`. */
    skill: string;
    channel: DistributionChannel;
    priority: number;
}

/** A segment definition: a declarative predicate over layer 3 + 4. */
export interface SegmentDefinition {
    id: string;
    name: string;
    rationale: string;
    play: string;
    /** Downstream skill to hand off to, e.g. `paywalls`, `cold-email`. */
    skill: string;
    channel: DistributionChannel;
    /** Lower runs first when deduplicating a customer to one action. */
    priority: number;
    test: (view: CustomerView) => boolean;
}

export interface CustomerView {
    identity: IdentityInput;
    attributes: CustomerAttributes;
    scores: CustomerScores;
    stage: LifecycleStage;
    segments: SegmentHit[];
    /** Human-readable "why is this person here", built from their own numbers. */
    narrative: string;
}

export interface SegmentRollup {
    id: string;
    name: string;
    rationale: string;
    play: string;
    skill: string;
    channel: DistributionChannel;
    priority: number;
    count: number;
    /** Naira value sitting in this segment, used to rank plays by worth. */
    volumeNgn: number;
    contactableCount: number;
    sample: Array<{
        key: string;
        businessName: string | null;
        contact: string | null;
        exports30d: number;
        volume90d: number;
    }>;
}

export interface SegmentationReport {
    generatedAt: string;
    population: PopulationStats;
    stageCounts: Record<string, number>;
    segments: SegmentRollup[];
    customers: CustomerView[];
    /** Ids that matched no segment — a blind spot worth seeing, not hiding. */
    unassignedCount: number;
}