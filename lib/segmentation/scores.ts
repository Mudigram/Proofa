/**
 * lib/segmentation/scores.ts
 *
 * Layer 4 — comparable judgements. Deliberately transparent linear composites,
 * NOT a trained model: at current conversion volumes a learned model would fit a
 * handful of data points, and an unexplainable score on a single merchant is worse
 * than no score. Every weight below is readable and adjustable in one place.
 */

import type { CustomerAttributes, CustomerScores, PopulationStats, RfmBucket } from "./types";

const DAY_MS = 86400000;

/** Population fallbacks used only when a real population median is unavailable. */
export const DEFAULT_POPULATION: PopulationStats = {
    medianExports30d: 2,
    medianDocValue: 25000,
    totalCustomers: 0,
    payingCustomers: 0,
};

function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

// ── RFM thresholds ────────────────────────────────────────────────────────────
// Tuned to Nigerian SME cadence: month-end payment cycles mean a merchant quiet for
// 14 days is drifting, not merely resting, and ₦ thresholds sit well below
// generic SaaS because median transaction size is small for micro-sellers.

export function scoreRecency(daysSinceLast: number | null): number {
    if (daysSinceLast === null) return 1;
    if (daysSinceLast <= 2) return 5;
    if (daysSinceLast <= 6) return 4;
    if (daysSinceLast <= 13) return 3;
    if (daysSinceLast <= 29) return 2;
    return 1;
}

export function scoreFrequency(exports30d: number): number {
    if (exports30d >= 10) return 5;
    if (exports30d >= 5) return 4;
    if (exports30d >= 3) return 3;
    if (exports30d >= 1) return 2;
    return 1;
}

export function scoreMonetary(volume90d: number): number {
    if (volume90d >= 1_000_000) return 5;
    if (volume90d >= 300_000) return 4;
    if (volume90d >= 100_000) return 3;
    if (volume90d >= 20_000) return 2;
    if (volume90d > 0) return 1;
    return 1;
}

export function rfmBucket(r: number, f: number, m: number, tenureDays: number): RfmBucket {
    if (r + f + m === 3) return "no-activity";
    if (r >= 4 && f >= 4 && m >= 4) return "champions";
    if (r >= 3 && f >= 3) return "loyal";
    if (r <= 2 && f >= 3 && m >= 4) return "can't-lose-them";
    if (r <= 2 && f >= 4) return "about-to-churn";
    if (r <= 2 && f >= 3) return "needs-attention";
    if (r >= 4 && f <= 2 && m >= 3) return "can't-lose-them";
    if (r >= 4 && f <= 2 && tenureDays <= 30) return "new";
    if (r >= 4 && f <= 2) return "promising";
    if (r >= 3 && f <= 2) return "needs-attention";
    if (r <= 2 && m >= 3) return "hibernating";
    return "lost";
}

/**
 * Engagement measured against the CUSTOMER'S OWN cadence.
 *
 * This is the load-bearing design decision in the file. Proofa's users include
 * daily sellers and strictly monthly traders. Against a population mean the monthly
 * trader always looks like churn risk and the model inverts; against their own
 * median gap, a monthly trader who traded this month scores high — which is true.
 */
export function engagementScore(a: CustomerAttributes, now: Date): number {
    const gap = a.medianActivityGapDays;
    const expectedDays = gap && gap > 0 ? clamp(30 / gap, 1, 30) : 2;
    const cadenceRatio = clamp(a.activityDays30d / expectedDays, 0, 1);

    // Recency relative to their own norm, not a constant. A monthly trader 20 days
    // quiet is on schedule; a daily seller 20 days quiet is gone.
    let normRatio = 0;
    if (a.daysSinceLast !== null) {
        const tolerance = gap && gap > 0 ? Math.max(gap * 2, 3) : 7;
        normRatio = clamp(1 - a.daysSinceLast / tolerance, 0, 1);
    }

    const breadth =
        clamp(a.exports30d / 10, 0, 1) * 0.4 +
        (a.pwaInstalled ? 0.2 : 0) +
        (a.bankDetailsSaved ? 0.2 : 0) +
        (a.exportsLifetime >= 5 ? 0.2 : 0);

    return Math.round(clamp(cadenceRatio * 45 + normRatio * 30 + breadth * 25, 0, 100));
}

/**
 * Purchase intent — likelihood of paying soon, for non-paying customers.
 * Gate views are weighted highest because a gate view is a live objection, whereas
 * volume alone is just usage.
 */
export function purchaseIntentScore(a: CustomerAttributes): number {
    let s = 0;
    s += Math.min(a.paywallViews7d, 3) * 12;          // ≤36 — live, decaying fast
    s += clamp(a.proFeatureTaps30d, 0, 4) * 6;        // ≤24 — gated feature desire
    s += Math.min(a.exports30d, 10) * 2;              // ≤20 — dependency forming
    if (a.avgDocValue >= 200_000) s += 8;             // big ticket → value in a receipt
    if (a.docsUsd90d > 0) s += 6;                     // foreign clients → needs PDF
    if (a.exports30d >= 5 && a.paywallViewsLifetime === 0) s += 6; // never shown a price
    if (a.secondExportWithin7d) s += 4;               // habit taking
    if (a.daysSinceLast !== null && a.daysSinceLast <= 2) s += 6;
    else if (a.daysSinceLast !== null && a.daysSinceLast <= 7) s += 3;
    return Math.round(clamp(s, 0, 100));
}

/** Health, paying customers only. `null` input → `null` output, never a fake 0. */
export function healthScore(
    a: CustomerAttributes,
    isPaying: boolean,
    population: PopulationStats,
    now: Date,
): { health: number | null; churnRisk: CustomerScores["churnRisk"] } {
    if (!isPaying) return { health: null, churnRisk: null };

    let s = engagementScore(a, now) * 0.5;
    s += clamp(a.proFeaturesUsed.length / 4, 0, 1) * 30;   // actually using what they pay for
    s += clamp(a.exports30d / Math.max(population.medianExports30d, 1), 0, 1) * 20;

    if (a.paymentFailed) s = Math.min(s, 25);              // mechanics beat sentiment
    if (a.exports30d === 0) s = Math.min(s, 40);           // paying and unused: the worst state

    const health = Math.round(clamp(s, 0, 100));
    const churnRisk = health < 40 ? "high" : health < 65 ? "medium" : "low";
    return { health, churnRisk };
}

export function computeScores(
    a: CustomerAttributes,
    opts: { isPaying: boolean; population?: PopulationStats; now: Date },
): CustomerScores {
    const population = opts.population ?? DEFAULT_POPULATION;
    const r = scoreRecency(a.daysSinceLast);
    const f = scoreFrequency(a.exports30d);
    const m = scoreMonetary(a.volume90d);
    const { health, churnRisk } = healthScore(a, opts.isPaying, population, opts.now);

    return {
        recency: r,
        frequency: f,
        monetary: m,
        rfm: r + f + m,
        rfmBucket: rfmBucket(r, f, m, a.tenureDays),
        engagement: engagementScore(a, opts.now),
        purchaseIntent: purchaseIntentScore(a),
        health,
        churnRisk,
    };
}

/** Exposed for tests and for re-calibration against live data. */
export const SCORING_META = {
    version: 1,
    windows: { short: 7, medium: 30, long: 90 },
    rfmThresholds: {
        recencyDays: [2, 6, 13, 29],
        frequencyExports: [1, 3, 5, 10],
        monetaryNgn: [1, 20_000, 100_000, 300_000, 1_000_000],
    },
    dayMs: DAY_MS,
};