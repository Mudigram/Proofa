import { describe, it, expect } from "vitest";
import {
    buildAttributes,
    buildExportFacts,
    computeScores,
    engagementScore,
    assignStage,
    segmentAll,
    deduplicateByTopPriority,
    isPayingPlan,
    EVENTS,
    type CustomerInput,
    type RawEvent,
    type RawDoc,
} from "@/lib/segmentation";

const NOW = new Date("2026-10-30T12:00:00.000Z");

function daysAgo(n: number, hourUtc = 9): string {
    const d = new Date(NOW.getTime() - n * 86_400_000);
    d.setUTCHours(hourUtc, 0, 0, 0);
    return d.toISOString();
}

function identity(over: Partial<CustomerInput["identity"]> = {}): CustomerInput["identity"] {
    return {
        key: over.key ?? "shw_test",
        kind: over.kind ?? "anonymous",
        userId: over.userId ?? null,
        shadowId: over.shadowId ?? "shw_test",
        plan: over.plan ?? "free",
        phone: over.phone ?? null,
        email: over.email ?? null,
        businessName: over.businessName ?? "Test Business",
        createdAt: over.createdAt ?? null,
        // Spread last so fields the defaults above do not enumerate — notably
        // subscriptionStatus and referredBy — are not silently dropped.
        ...over,
    };
}

function exportEvent(daysBack: number, amount: number, docType = "receipt"): RawEvent {
    return {
        shadowId: "shw_test",
        userId: null,
        eventName: EVENTS.DOC_EXPORTED,
        eventType: "doc_exported",
        properties: { docType, amount, currency: "NGN" },
        createdAt: daysAgo(daysBack),
    };
}

function doc(daysBack: number, amount: number, type = "receipt"): RawDoc {
    return { ownerId: "u1", type, amount, currency: "NGN", createdAt: daysAgo(daysBack) };
}

describe("buildExportFacts — double-counting guard", () => {
    it("does not double-count the same action seen in both documents and telemetry", () => {
        // An authenticated merchant writes a `documents` row AND fires `doc_exported`.
        const input: CustomerInput = {
            identity: identity({ kind: "authenticated", userId: "u1", plan: "pro" }),
            events: [exportEvent(3, 50_000)],
            docs: [doc(3, 50_000)],
        };
        expect(buildExportFacts(input)).toHaveLength(1);
    });

    it("keeps genuinely different documents apart", () => {
        const input: CustomerInput = {
            identity: identity(),
            events: [exportEvent(1, 5_000), exportEvent(1, 7_500)],
            docs: [],
        };
        expect(buildExportFacts(input)).toHaveLength(2);
    });

    it("separates by type even at identical amount on the same day", () => {
        const input: CustomerInput = {
            identity: identity(),
            events: [exportEvent(1, 10_000, "receipt"), exportEvent(1, 10_000, "invoice")],
            docs: [],
        };
        expect(buildExportFacts(input)).toHaveLength(2);
    });

    it("ignores soft-deleted documents", () => {
        const input: CustomerInput = {
            identity: identity(),
            events: [],
            docs: [{ ...doc(2, 10_000), deletedAt: daysAgo(1) }],
        };
        expect(buildExportFacts(input)).toHaveLength(0);
    });
});

describe("buildAttributes", () => {
    it("reports null recency for a customer with no activity", () => {
        const a = buildAttributes({ identity: identity(), events: [], docs: [] }, NOW);
        expect(a.daysSinceLast).toBeNull();
        expect(a.exportsLifetime).toBe(0);
        expect(a.avgDocValue).toBe(0);
    });

    it("windows exports into 7/30/90 correctly", () => {
        const input: CustomerInput = {
            identity: identity(),
            events: [exportEvent(2, 1000), exportEvent(20, 1000), exportEvent(60, 1000), exportEvent(200, 1000)],
            docs: [],
        };
        const a = buildAttributes(input, NOW);
        expect(a.exports7d).toBe(1);
        expect(a.exports30d).toBe(2);
        expect(a.exports90d).toBe(3);
        expect(a.exportsLifetime).toBe(4);
    });

    it("flags second export within 7 days as activation", () => {
        const activated = buildAttributes({ identity: identity(), events: [exportEvent(6, 100), exportEvent(2, 100)], docs: [] }, NOW);
        const slow = buildAttributes({ identity: identity(), events: [exportEvent(60, 100), exportEvent(2, 100)], docs: [] }, NOW);
        expect(activated.secondExportWithin7d).toBe(true);
        expect(slow.secondExportWithin7d).toBe(false);
    });

    it("detects WhatsApp reachability only from a plausible phone number", () => {
        expect(buildAttributes({ identity: identity({ phone: "2348012345678" }), events: [], docs: [] }, NOW).contactable).toBe("whatsapp");
        expect(buildAttributes({ identity: identity({ phone: "123", email: "a@b.com" }), events: [], docs: [] }, NOW).contactable).toBe("email");
        expect(buildAttributes({ identity: identity(), events: [], docs: [] }, NOW).contactable).toBe("none");
    });

    it("separates gated intent from genuine Pro feature usage", () => {
        const input: CustomerInput = {
            identity: identity({ plan: "pro", kind: "authenticated", userId: "u1" }),
            events: [
                { shadowId: "s", userId: "u1", eventName: EVENTS.PRO_FEATURE_USED, properties: { feature: "pdf_export" }, createdAt: daysAgo(1) },
                { shadowId: "s", userId: "u1", eventName: EVENTS.PRO_FEATURE_USED, properties: { feature: "cloud_history" }, createdAt: daysAgo(2) },
                { shadowId: "s", userId: "u1", eventName: EVENTS.FEATURE_INTENT, properties: { feature: "logo_upload" }, createdAt: daysAgo(3) },
            ],
            docs: [],
        };
        const a = buildAttributes(input, NOW);
        expect(a.proFeaturesUsed.sort()).toEqual(["cloud_history", "pdf_export"]);
        expect(a.proFeatureTapsLifetime).toBe(1); // intent only — usage is not a "tap"
    });

    it("records gate variants for objection routing", () => {
        const input: CustomerInput = {
            identity: identity(),
            events: [
                { shadowId: "s", userId: null, eventName: EVENTS.UPGRADE_GATE_VIEWED, properties: { variant: "logo" }, createdAt: daysAgo(1) },
                { shadowId: "s", userId: null, eventName: EVENTS.UPGRADE_GATE_VIEWED, properties: { variant: "export" }, createdAt: daysAgo(2) },
            ],
            docs: [],
        };
        const a = buildAttributes(input, NOW);
        expect(a.paywallViewsLifetime).toBe(2);
        expect(a.paywallViews7d).toBe(2);
        expect(a.gateVariants.sort()).toEqual(["export", "logo"]);
    });
});

describe("scores", () => {
    it("RFM rates a fresh high-volume seller 5/5/5", () => {
        const a = buildAttributes({ identity: identity(), events: Array.from({ length: 12 }, (_, i) => exportEvent(i * 2, 120_000)), docs: [] }, NOW);
        const s = computeScores(a, { isPaying: false, now: NOW });
        expect(s.recency).toBe(5);
        expect(s.frequency).toBe(5);
        expect(s.monetary).toBe(5);
        expect(s.rfmBucket).toBe("champions");
    });

    it("treats health as undefined rather than zero for free users", () => {
        const a = buildAttributes({ identity: identity(), events: [exportEvent(1, 1000)], docs: [] }, NOW);
        expect(computeScores(a, { isPaying: false, now: NOW }).health).toBeNull();
    });

    it("caps health when payment has failed", () => {
        const input: CustomerInput = {
            identity: identity({ plan: "pro", kind: "authenticated", userId: "u1", subscriptionStatus: "past_due" }),
            events: Array.from({ length: 12 }, (_, i) => exportEvent(i, 100_000)),
            docs: [],
        };
        const a = buildAttributes(input, NOW);
        expect(a.paymentFailed).toBe(true);
        expect(computeScores(a, { isPaying: true, now: NOW }).health).toBeLessThanOrEqual(25);
    });

    it("scores a paying-but-unused customer as high churn risk", () => {
        const input: CustomerInput = {
            identity: identity({ plan: "pro", kind: "authenticated", userId: "u1" }),
            events: [{ shadowId: "s", userId: "u1", eventName: EVENTS.SESSION_PING, createdAt: daysAgo(1) }],
            docs: [],
        };
        const s = computeScores(buildAttributes(input, NOW), { isPaying: true, now: NOW });
        expect(s.churnRisk).toBe("high");
    });
});

describe("engagement is relative to the customer's own cadence", () => {
    it("rates a monthly trader who traded this month ABOVE a daily seller who went quiet", () => {
        // Monthly trader: active once a month, right on schedule.
        const monthly: CustomerInput = {
            identity: identity({ key: "monthly" }),
            events: [exportEvent(85, 50_000), exportEvent(55, 50_000), exportEvent(25, 50_000), exportEvent(3, 50_000)],
            docs: [],
        };
        // Daily seller: usually every day, silent for 12 days.
        const daily: CustomerInput = {
            identity: identity({ key: "daily" }),
            events: [
                ...Array.from({ length: 18 }, (_, i) => exportEvent(40 + i, 5_000)),
                ...Array.from({ length: 4 }, (_, i) => exportEvent(14 + i, 5_000)),
            ],
            docs: [],
        };
        const monthlyScore = engagementScore(buildAttributes(monthly, NOW), NOW);
        const dailyScore = engagementScore(buildAttributes(daily, NOW), NOW);
        expect(monthlyScore).toBeGreaterThan(dailyScore);
    });
});

describe("lifecycle stages", () => {
    const attrs = (over: Partial<ReturnType<typeof buildAttributes>> = {}) => ({
        ...buildAttributes({ identity: identity(), events: [], docs: [] }, NOW),
        ...over,
    });

    it("assigns visitor when nothing was exported", () => {
        expect(assignStage(attrs({ exportsLifetime: 0, sessions30d: 3 }), false)).toBe("visitor");
    });
    it("assigns first-win on exactly one export", () => {
        expect(assignStage(attrs({ exportsLifetime: 1, daysSinceLast: 2, medianActivityGapDays: null }), false)).toBe("first-win");
    });
    it("assigns dormant beyond own norm and lost beyond the recovery window", () => {
        expect(assignStage(attrs({ exportsLifetime: 8, daysSinceLast: 30, medianActivityGapDays: 3 }), false)).toBe("dormant");
        expect(assignStage(attrs({ exportsLifetime: 8, daysSinceLast: 200, medianActivityGapDays: 3 }), false)).toBe("lost");
    });
    it("prioritises paid state over volume", () => {
        expect(assignStage(attrs({ exportsLifetime: 40, exports30d: 0, daysSinceLast: 20 }), true)).toBe("at-risk-paid");
        expect(assignStage(attrs({ exportsLifetime: 40, exports30d: 12, daysSinceLast: 1 }), true)).toBe("paying");
    });
    it("does not flag a monthly trader dormant at 20 days quiet", () => {
        // Guards the 21-day floor: month-end traders would otherwise all read as churned.
        expect(assignStage(attrs({ exportsLifetime: 8, daysSinceLast: 20, medianActivityGapDays: 28 }), false)).not.toBe("dormant");
    });
});

describe("segments", () => {
    const run = (input: CustomerInput) => segmentAll([input], NOW).customers[0];
    const has = (input: CustomerInput, id: string) => run(input).segments.some((s) => s.id === id);

    it("flags a free high-volume user who was never shown a price", () => {
        expect(
            has({ identity: identity(), events: Array.from({ length: 7 }, (_, i) => exportEvent(i * 3, 20_000)), docs: [] }, "power-exporter-free"),
        ).toBe(true);
    });

    it("flags brand-conscious-stalled only when no gate was ever seen", () => {
        const noGate: CustomerInput = {
            identity: identity({ phone: "2348012345678" }),
            events: [
                { shadowId: "s", userId: null, eventName: EVENTS.FEATURE_INTENT, properties: { feature: "logo_upload" }, createdAt: daysAgo(2) },
                exportEvent(1, 20_000),
            ],
            docs: [],
        };
        expect(has(noGate, "brand-conscious-stalled")).toBe(true);
        expect(has(noGate, "upgrade-gate-stalled")).toBe(false);
    });

    it("flags upgrade-gate-stalled once a price has been seen", () => {
        const input: CustomerInput = {
            identity: identity({ phone: "2348012345678" }),
            events: [
                exportEvent(2, 20_000),
                { shadowId: "s", userId: null, eventName: EVENTS.UPGRADE_GATE_VIEWED, properties: { variant: "export" }, createdAt: daysAgo(1) },
            ],
            docs: [],
        };
        expect(has(input, "upgrade-gate-stalled")).toBe(true);
    });

    it("identifies big-ticket low-frequency sellers by value not count", () => {
        expect(has({ identity: identity(), events: [exportEvent(10, 2_500_000)], docs: [] }, "big-ticket-low-freq")).toBe(true);
    });

    it("never puts a buyer in a marketing segment", () => {
        // Buyer phone lands in event properties; it must not become a contact.
        const input: CustomerInput = {
            identity: identity(),
            events: [{ ...exportEvent(1, 5_000), properties: { amount: 5_000, docType: "receipt", customerPhone: "2348099999999" } }],
            docs: [],
        };
        const view = run(input);
        expect(view.attributes.contactable).toBe("none");
        expect(view.identity.phone).toBeNull();
    });

    it("assigns paying-but-unused customers to the paid retention segment", () => {
        const input: CustomerInput = {
            identity: identity({ plan: "pro", kind: "authenticated", userId: "u1", phone: "2348012345678" }),
            events: Array.from({ length: 10 }, (_, i) => exportEvent(40 + i, 30_000)),
            docs: [],
        };
        expect(has(input, "churn-risk-paid")).toBe(true);
    });
});

describe("segmentAll report", () => {
    const base: CustomerInput[] = [
        { identity: identity({ key: "a", phone: "2348012345678" }), events: Array.from({ length: 12 }, (_, i) => exportEvent(i * 2, 120_000)), docs: [] },
        { identity: identity({ key: "b" }), events: [{ shadowId: "b", userId: null, eventName: EVENTS.SESSION_PING, createdAt: daysAgo(1) }], docs: [] },
        { identity: identity({ key: "c", plan: "pro", kind: "authenticated", userId: "u3" }), events: Array.from({ length: 6 }, (_, i) => exportEvent(i * 3, 40_000)), docs: [] },
    ];

    it("produces stage counts that sum to the population", () => {
        const report = segmentAll(base, NOW);
        const total = Object.values(report.stageCounts).reduce((a, b) => a + b, 0);
        expect(total).toBe(3);
        expect(report.population.totalCustomers).toBe(3);
        expect(report.population.payingCustomers).toBe(1);
    });

    it("rolls up segment counts and Naira value", () => {
        const report = segmentAll(base, NOW);
        for (const seg of report.segments) {
            expect(seg.count).toBeGreaterThan(0);
            expect(seg.sample.length).toBeGreaterThan(0);
            expect(seg.sample.length).toBeLessThanOrEqual(8);
        }
    });

    it("writes a narrative containing only the customer's own numbers", () => {
        const view = segmentAll(base, NOW).customers[0];
        expect(view.narrative).toMatch(/12 documents/);
        expect(view.narrative).toMatch(/reachable on WhatsApp/);
        expect(view.narrative).not.toMatch(/thousands|trusted by|best|5-star/i);
    });

    it("deduplicates a customer down to the single highest-priority segment", () => {
        // One customer engineered to match several segments at once.
        const crowded: CustomerInput = {
            identity: identity({ key: "x", plan: "pro", kind: "authenticated", userId: "u9", phone: "2348012345678", subscriptionStatus: "past_due" }),
            events: [
                ...Array.from({ length: 12 }, (_, i) => exportEvent(i * 2, 120_000)),
                { shadowId: "x", userId: "u9", eventName: EVENTS.FEATURE_INTENT, properties: { feature: "logo_upload" }, createdAt: daysAgo(1) },
            ],
            docs: [],
        };
        const report = segmentAll([crowded], NOW);
        expect(report.customers[0].segments.length).toBeGreaterThan(1);
        const lists = deduplicateByTopPriority(report);
        const allKeys = [...lists.values()].flat();
        expect(allKeys.filter((k) => k === "x")).toHaveLength(1);
        expect(lists.get("dunning-recoverable")).toContain("x");
    });

    it("can exclude non-contact channels when building send lists", () => {
        const report = segmentAll(base, NOW);
        const lists = deduplicateByTopPriority(report, { excludeChannels: ["none", "in-product"] });
        expect([...lists.keys()]).not.toContain("never-activated");
    });
});

describe("isPayingPlan", () => {
    it("recognises paid tiers case-insensitively and rejects free/unknown", () => {
        expect(isPayingPlan("pro")).toBe(true);
        expect(isPayingPlan("Business")).toBe(true);
        expect(isPayingPlan("free")).toBe(false);
        expect(isPayingPlan(null)).toBe(false);
        expect(isPayingPlan(undefined)).toBe(false);
    });
});