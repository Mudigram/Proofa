/**
 * lib/segmentation/segments.ts
 *
 * Layer 5 — declarative, enumerable predicates over attributes + scores.
 *
 * IDs here MUST match `.agents/skills/marketing-decisions/references/segment-catalog.md`.
 * The catalog holds the play; this file holds the predicate. If one changes without
 * the other, the admin console will show a segment with no playbook attached.
 *
 * Every predicate must resolve to a concrete ID list. If a definition cannot, it is
 * a persona, not a segment, and does not belong here.
 */

import type { CustomerView, SegmentDefinition } from "./types";
import { dormantThreshold } from "./lifecycle";

const isPaid = (v: CustomerView) => ["pro", "business"].includes(String(v.identity.plan).toLowerCase());
const isFree = (v: CustomerView) => !isPaid(v);

const quietPastNorm = (v: CustomerView) =>
    v.attributes.daysSinceLast !== null && v.attributes.daysSinceLast > dormantThreshold(v.attributes);

export const SEGMENTS: SegmentDefinition[] = [
    {
        id: "dunning-recoverable",
        name: "Payment failed / lapsed",
        rationale: "Almost always a failed transfer or expired card, not a decision to leave.",
        play: "Personal WhatsApp: 'your Pro lapsed, want me to reinstate it?' No formal dunning chain.",
        skill: "churn-prevention",
        channel: "whatsapp",
        priority: 1,
        test: (v) => v.attributes.paymentFailed && isPaid(v),
    },
    {
        id: "churn-risk-paid",
        name: "Paid but disengaging",
        rationale: "Saving a small sub is worth more than winning a new one - already acquired, already trusting.",
        play: "Save offer and usage review before any marketing activity.",
        skill: "churn-prevention",
        channel: "whatsapp",
        priority: 2,
        test: (v) => isPaid(v) && (v.scores.churnRisk === "high" || v.stage === "at-risk-paid"),
    },
    {
        id: "upgrade-gate-stalled",
        name: "Saw the price, didn't buy",
        rationale: "A live price or trust objection, still warm. Decays within days.",
        play: "Route by gate variant - export to value, logo to identity, history to loss aversion. Same offer, different first line.",
        skill: "marketing-psychology",
        channel: "whatsapp",
        priority: 3,
        test: (v) =>
            isFree(v) &&
            v.attributes.paywallViewsLifetime >= 1 &&
            v.attributes.daysSinceLast !== null &&
            v.attributes.daysSinceLast <= 7,
    },
    {
        id: "brand-conscious-stalled",
        name: "Wanted branding, never saw a price",
        rationale: "Desire proven, price never encountered. This is a paywall placement gap, not a demand gap.",
        play: "Founder note plus Pro logo demo, pre-applied to their own receipt. File the gate-placement fix too.",
        skill: "paywalls",
        channel: "whatsapp",
        priority: 4,
        test: (v) =>
            isFree(v) &&
            v.attributes.proFeatureTaps30d >= 1 &&
            v.attributes.paywallViewsLifetime === 0 &&
            v.attributes.daysSinceLast !== null &&
            v.attributes.daysSinceLast <= 14,
    },
    {
        id: "power-exporter-free",
        name: "Running a business on free",
        rationale: "Real volume, never shown a reason to pay. Highest worth-per-head segment on the product.",
        play: "Paywall at the export moment (PRO_PLAN Trigger A). If volume is large and conversion zero, the gate is misplaced.",
        skill: "paywalls",
        channel: "in-product",
        priority: 5,
        test: (v) => isFree(v) && v.attributes.exports30d >= 5 && v.attributes.paywallViewsLifetime === 0,
    },
    {
        id: "cross-border",
        name: "Has foreign clients",
        rationale: "Dollar exposure means higher income and a genuine PDF and currency need.",
        play: "Pro pack on PDF plus currency: bill your Lagos client and your London client properly.",
        skill: "offers",
        channel: "whatsapp",
        priority: 6,
        test: (v) => v.attributes.docsUsd90d >= 1,
    },
    {
        id: "big-ticket-low-freq",
        name: "Big-ticket, few documents",
        rationale: "One document is worth more than a year of subscription. Highest willingness to pay per interaction.",
        play: "Founder call or WhatsApp, named, never automated. Sell credibility under a large transaction.",
        skill: "prospecting",
        channel: "whatsapp",
        priority: 7,
        test: (v) => v.attributes.volume90d >= 1_000_000 && v.attributes.exports90d <= 5,
    },
    {
        id: "invoice-upsell",
        name: "Takes money, never requests it",
        rationale: "Receipt-only sellers likely extend credit and struggle to collect - a painful unpaid-for problem.",
        play: "Invoice-first education: get paid, not chased. Strong lead-magnet and status-explainer candidate.",
        skill: "lead-magnets",
        channel: "whatsapp",
        priority: 12,
        test: (v) => v.attributes.exportsLifetime >= 3 && v.attributes.receiptShare > 0.8 && v.attributes.invoiceCount === 0,
    },
    {
        id: "never-activated",
        name: "Never produced a document",
        rationale: "Arrived with intent and stopped. The blocking event is in the stream, so the fix is knowable.",
        play: "Do not send anything. Find the event immediately before their last and fix that step.",
        skill: "cro",
        channel: "none",
        priority: 8,
        test: (v) => v.attributes.exportsLifetime === 0 && v.attributes.sessions30d >= 1,
    },
    {
        id: "first-win-earned",
        name: "One export only",
        rationale: "The habit does not exist yet. Second export within 7 days is the true activation metric.",
        play: "One message that helps them send the SECOND receipt (save bank details, reuse business name).",
        skill: "onboarding",
        channel: "whatsapp",
        priority: 9,
        test: (v) => v.attributes.exportsLifetime === 1 && (v.attributes.daysSinceFirst ?? 99) <= 7,
    },
    {
        id: "ghosted-after-first",
        name: "Left after the first receipt",
        rationale: "Cheapest source of real product insight available. Ask, do not pitch.",
        play: "Founder WhatsApp asking what stopped them. Nearly always the customer did not react, or they could not find it again.",
        skill: "customer-research",
        channel: "whatsapp",
        priority: 10,
        test: (v) =>
            v.attributes.exportsLifetime === 1 &&
            v.attributes.daysSinceLast !== null &&
            v.attributes.daysSinceLast > 14 &&
            (v.attributes.daysSinceFirst ?? 0) <= 45,
    },
    {
        id: "pwa-install-ready",
        name: "Repeat mobile user, not installed",
        rationale: "One tap from home-screen and re-engagement that costs nothing forever after.",
        play: "In-app install prompt after the second export. Cheapest retention lever in the product.",
        skill: "cro",
        channel: "in-product",
        priority: 13,
        test: (v) => /android/i.test(v.attributes.platform) && !v.attributes.pwaInstalled && v.attributes.exportsLifetime >= 2,
    },
    {
        id: "dormant-winnable",
        name: "Had a habit, lost it",
        rationale: "Recoverable only inside about 60 days, and only with their own true numbers.",
        play: "Win-back anchored on their own history - you sent 14 receipts in March. Never an estimate.",
        skill: "emails",
        channel: "whatsapp",
        priority: 11,
        test: (v) => v.attributes.exportsLifetime >= 3 && quietPastNorm(v) && (v.attributes.daysSinceLast ?? 0) <= 60,
    },
    {
        id: "loyalty-loop",
        name: "Loyal, active, valuable",
        rationale: "The ONLY segment permitted to be asked for favours. Sole legitimate source of social proof.",
        play: "Ask for a voice-note testimonial and referrals. Never send this segment a discount.",
        skill: "referrals",
        channel: "whatsapp",
        priority: 14,
        test: (v) =>
            v.scores.rfm >= 12 &&
            v.attributes.exportsLifetime >= 10 &&
            v.attributes.daysSinceLast !== null &&
            v.attributes.daysSinceLast <= 14 &&
            v.scores.churnRisk !== "high",
    },
    {
        id: "high-turnover-thin-margin",
        name: "High volume, small amounts",
        rationale: "Provisions, food, airtime, small retail. Speed is the whole product; polish is irrelevant.",
        play: "Sell Business volume features (bulk, reuse, history). Selling a logo to a thin-margin seller is a category error.",
        skill: "offers",
        channel: "whatsapp",
        priority: 15,
        test: (v) => v.attributes.exports30d >= 8 && v.attributes.avgDocValue > 0 && v.attributes.avgDocValue < 15_000,
    },
    {
        id: "shadow-lead-high-intent",
        name: "Anonymous, high intent",
        rationale: "Intent without identity, and their history dies with their phone - which is the honest hook.",
        play: "WhatsApp: create an account so your receipts survive a phone change.",
        skill: "signup",
        channel: "whatsapp",
        priority: 16,
        test: (v) => v.identity.kind === "anonymous" && v.attributes.proFeatureTapsLifetime >= 1 && v.attributes.contactable === "whatsapp",
    },
    {
        id: "shadow-lead-reachable",
        name: "Anonymous with real volume",
        rationale: "A trading business generating volume with no account and a reachable number.",
        play: "WhatsApp with their business name and their own receipt count. Never use any buyer contact.",
        skill: "prospecting",
        channel: "whatsapp",
        priority: 17,
        test: (v) => v.identity.kind === "anonymous" && v.attributes.contactable === "whatsapp" && v.attributes.exportsLifetime >= 3,
    },
];

export const SEGMENT_BY_ID: Record<string, SegmentDefinition> = Object.fromEntries(
    SEGMENTS.map((s) => [s.id, s]),
);

/**
 * All segments a customer matches, ordered by priority (most urgent first).
 *
 * Takes only the four fields predicates can read. Predicates must not depend on
 * `segments` (membership would become self-referential) or on `narrative`, which
 * is generated from the result and does not exist yet at this point.
 */
export function resolveSegments(
    view: Pick<CustomerView, "identity" | "attributes" | "scores" | "stage">,
): SegmentDefinition[] {
    return SEGMENTS.filter((s) => {
        try {
            return s.test(view as CustomerView);
        } catch {
            return false;
        }
    }).sort((a, b) => a.priority - b.priority);
}