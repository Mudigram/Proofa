/**
 * lib/segmentation/lifecycle.ts
 *
 * A single primary stage per customer, from a priority-ordered state machine.
 *
 * Order matters and is not arbitrary: paid-state is checked before inactivity so a
 * lapsed subscriber is never reported as merely "dormant" (it is a revenue event),
 * and inactivity is checked before volume so a lapsed high-volume seller is not
 * reported as "regular" when they are actually walking away.
 */

import type { CustomerAttributes, LifecycleStage } from "./types";

/**
 * Quiet threshold scaled to the customer's own cadence, floor 21 days.
 *
 * The 21-day floor exists because month-end traders get paid monthly: 14 days of
 * silence mid-month is normal for them, so a flat 14-day rule would flag a healthy
 * base as churned every single month.
 */
export function dormantThreshold(a: CustomerAttributes): number {
    const gap = a.medianActivityGapDays ?? 0;
    return Math.max(21, Math.round(gap * 2));
}

export function lostThreshold(a: CustomerAttributes): number {
    return Math.max(60, dormantThreshold(a) * 2);
}

export function assignStage(a: CustomerAttributes, isPaying: boolean): LifecycleStage {
    const quiet = a.daysSinceLast;
    const dormantAt = dormantThreshold(a);
    const lostAt = lostThreshold(a);

    if (isPaying) {
        const tooQuiet = quiet !== null && quiet > Math.max(14, dormantAt);
        const unused = a.exports30d === 0;
        return tooQuiet || unused ? "at-risk-paid" : "paying";
    }

    if (a.exportsLifetime === 0) return "visitor";
    if (quiet === null) return "visitor";
    if (quiet > lostAt) return "lost";
    if (quiet > dormantAt) return "dormant";

    if (a.exportsLifetime === 1) return "first-win";
    if (a.exportsLifetime >= 15 && quiet <= 14) return "committed";
    if (a.exports30d >= 5) return "regular";
    if (a.exportsLifetime <= 4) return "forming";
    return "regular";
}

/** Copy for the admin console — what the stage means in one line. */
export const STAGE_MEANING: Record<LifecycleStage, string> = {
    visitor: "Opened the form, never produced a document. The leak is in the flow, not the demand.",
    "first-win": "One receipt exists, the habit does not. Most fragile moment in the lifecycle.",
    forming: "Two to four exports. Push the second export within seven days or lose them.",
    regular: "Habitual exporter. Upgrade and referral candidate.",
    committed: "Long tenure, sustained volume. Ask this stage for testimonials and referrals.",
    dormant: "Quiet far beyond their own normal cadence. Recoverable inside ~60 days only.",
    lost: "Quiet beyond the recovery window. Do not spend budget here.",
    "at-risk-paid": "Paying and disengaging. Retention economics beat any acquisition play.",
    paying: "Paying and healthy. Protect, expand, and ask for proof.",
};