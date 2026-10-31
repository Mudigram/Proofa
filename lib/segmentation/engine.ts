/**
 * lib/segmentation/engine.ts
 *
 * Orchestrates the five layers into a report. Pure — the caller supplies rows read
 * from Supabase, so the whole model can be re-run over history or unit-tested
 * without a database.
 */

import type {
    CustomerAttributes,
    CustomerInput,
    CustomerView,
    EvalContext,
    PopulationStats,
    SegmentRollup,
    SegmentationReport,
} from "./types";
import { buildAttributes } from "./attributes";
import { computeScores, DEFAULT_POPULATION } from "./scores";
import { assignStage, STAGE_MEANING } from "./lifecycle";
import { SEGMENTS, resolveSegments } from "./segments";

export function isPayingPlan(plan: string | null | undefined): boolean {
    const p = String(plan ?? "").toLowerCase();
    return p === "pro" || p === "business";
}

function median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Population calibration. Medians come from *active* customers only — including
 * long-dead accounts in the median drags it down and makes everyone look more
 * engaged relative to the base than they are.
 */
export function buildPopulationStats(
    attrs: CustomerAttributes[],
    payingCount: number,
): PopulationStats {
    const active = attrs.filter((a) => a.exports30d > 0);
    const exportCounts = active.map((a) => a.exports30d);
    const docValues = attrs.filter((a) => a.avgDocValue > 0).map((a) => a.avgDocValue);

    return {
        medianExports30d: median(exportCounts) || DEFAULT_POPULATION.medianExports30d,
        medianDocValue: median(docValues) || DEFAULT_POPULATION.medianDocValue,
        totalCustomers: attrs.length,
        payingCustomers: payingCount,
    };
}

function ngn(n: number): string {
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(Math.round(n));
    } catch {
        return `₦${Math.round(n).toLocaleString("en-NG")}`;
    }
}

/**
 * A one-line "why is this person here", assembled only from their own true numbers.
 * No estimates, no rounding up, and nothing that could be mistaken for social proof.
 */
export function buildNarrative(view: CustomerView): string {
    const a = view.attributes;
    const parts: string[] = [];

    if (a.exportsLifetime === 0) {
        parts.push("Opened the form but never produced a document");
    } else {
        const kinds = [
            a.receiptCount ? `${a.receiptCount} receipt${a.receiptCount === 1 ? "" : "s"}` : null,
            a.invoiceCount ? `${a.invoiceCount} invoice${a.invoiceCount === 1 ? "" : "s"}` : null,
            a.orderCount ? `${a.orderCount} order${a.orderCount === 1 ? "" : "s"}` : null,
        ].filter(Boolean);
        parts.push(`Sent ${a.exportsLifetime} document${a.exportsLifetime === 1 ? "" : "s"} (${kinds.join(", ") || "uncategorised"})`);
        if (a.volumeLifetime > 0) parts.push(`worth ${ngn(a.volumeLifetime)} lifetime`);
    }

    parts.push(
        a.daysSinceLast === null
            ? "no recorded activity"
            : `last seen ${a.daysSinceLast} day${a.daysSinceLast === 1 ? "" : "s"} ago`,
    );

    if (a.medianActivityGapDays && a.medianActivityGapDays > 0) {
        parts.push(`normally active every ~${Math.round(a.medianActivityGapDays)} day${Math.round(a.medianActivityGapDays) === 1 ? "" : "s"}`);
    }
    if (a.proFeatureTapsLifetime > 0) {
        parts.push(`touched ${a.proFeatureTapsLifetime} Pro control${a.proFeatureTapsLifetime === 1 ? "" : "s"}`);
    }
    if (a.paywallViewsLifetime > 0) {
        parts.push(`saw the price ${a.paywallViewsLifetime}×${a.gateVariants.length ? ` (${a.gateVariants.join(", ")})` : ""}`);
    } else if (a.proFeatureTapsLifetime > 0 && !isPayingPlan(view.identity.plan)) {
        parts.push("never reached a price");
    }
    if (a.proFeaturesUsed.length > 0) parts.push(`actively using ${a.proFeaturesUsed.join(", ")}`);
    if (a.exports30d > 0) parts.push(`${a.exports30d} in the last 30 days`);
    if (a.contactable === "whatsapp") parts.push("reachable on WhatsApp");
    else if (a.contactable === "email") parts.push("reachable by email only");
    else parts.push("no contact detail captured");

    return `${STAGE_MEANING[view.stage]} — ${parts.join("; ")}.`;
}

interface Prepared {
    input: CustomerInput;
    attrs: CustomerAttributes;
    paying: boolean;
}

/**
 * Full pass: attributes for everyone → population calibration → scores + stage +
 * segments. Two passes are required because engagement is relative to the
 * population median, which cannot exist before attributes are computed.
 */
export function segmentAll(
    inputs: CustomerInput[],
    now: Date = new Date(),
): SegmentationReport {
    const prepared: Prepared[] = inputs.map((input) => ({
        input,
        attrs: buildAttributes(input, now),
        paying: isPayingPlan(input.identity.plan),
    }));

    const population = buildPopulationStats(
        prepared.map((p) => p.attrs),
        prepared.filter((p) => p.paying).length,
    );

    const customers: CustomerView[] = prepared.map((p) => {
        const scores = computeScores(p.attrs, { isPaying: p.paying, population, now });
        const stage = assignStage(p.attrs, p.paying);
        const base = { identity: p.input.identity, attributes: p.attrs, scores, stage };
        const segments = resolveSegments(base).map((s) => ({
            id: s.id,
            name: s.name,
            rationale: s.rationale,
            play: s.play,
            skill: s.skill,
            channel: s.channel,
            priority: s.priority,
        }));
        const view: CustomerView = { ...base, segments, narrative: "" };
        view.narrative = buildNarrative(view);
        return view;
    });

    const stageCounts: Record<string, number> = {};
    for (const c of customers) {
        stageCounts[c.stage] = (stageCounts[c.stage] ?? 0) + 1;
    }

    const segments: SegmentRollup[] = [];
    for (const seg of segmentDefinitionsOrdered()) {
        const members = customers.filter((c) => c.segments.some((s) => s.id === seg.id));
        if (members.length === 0) continue;
        segments.push({
            id: seg.id,
            name: seg.name,
            rationale: seg.rationale,
            play: seg.play,
            skill: seg.skill,
            channel: seg.channel,
            priority: seg.priority,
            count: members.length,
            volumeNgn: members.reduce((sum, m) => sum + m.attributes.volume90d, 0),
            contactableCount: members.filter((m) => m.attributes.contactable !== "none").length,
            sample: members.slice(0, 8).map((m) => ({
                key: m.identity.key,
                businessName: m.identity.businessName ?? null,
                contact: m.identity.phone ?? m.identity.email ?? null,
                exports30d: m.attributes.exports30d,
                volume90d: m.attributes.volume90d,
            })),
        });
    }

    return {
        generatedAt: now.toISOString(),
        population,
        stageCounts,
        segments: segments.sort((a, b) => a.priority - b.priority),
        customers,
        unassignedCount: customers.filter((c) => c.segments.length === 0).length,
    };
}

function segmentDefinitionsOrdered() {
    return [...SEGMENTS].sort((a, b) => a.priority - b.priority);
}

/** Single-customer convenience for drill-down views. */
export function evaluateCustomer(input: CustomerInput, ctx?: Partial<EvalContext>): CustomerView {
    const report = segmentAll([input], ctx?.now ?? new Date());
    return report.customers[0];
}

/**
 * Deduplicates target lists across segments so a merchant receives at most one
 * outbound touch per window, and never the lower-priority one.
 *
 * Without this, an overlapping customer (paid, disengaging, high volume) gets three
 * contradictory messages in a week — which in a small, loud market is how a product
 * gets publicly complained about.
 */
export function deduplicateByTopPriority(
    report: SegmentationReport,
    opts: { excludeChannels?: string[] } = {},
): Map<string, string[]> {
    const excluded = new Set(opts.excludeChannels ?? []);
    const winner = new Map<string, { id: string; priority: number }>();

    for (const customer of report.customers) {
        const hits = customer.segments
            .filter((s) => !excluded.has(s.channel))
            .sort((a, b) => a.priority - b.priority);
        if (hits.length === 0) continue;
        winner.set(customer.identity.key, { id: hits[0].id, priority: hits[0].priority });
    }

    const lists = new Map<string, string[]>();
    for (const [key, w] of winner) {
        const arr = lists.get(w.id) ?? [];
        arr.push(key);
        lists.set(w.id, arr);
    }
    return lists;
}