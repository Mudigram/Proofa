/**
 * lib/segmentation/attributes.ts
 *
 * Layer 3 — derive windowed, recomputable facts from the raw event + document
 * streams. Pure functions only.
 */

import type { CustomerInput, CustomerAttributes, PeakHourBand, ContactChannel, RawEvent } from "./types";
import {
    EVENTS,
    eventAmount,
    eventCurrency,
    eventDocType,
    eventFeature,
    eventGateVariant,
    isSessionEvent,
} from "./events";

/** Business timezone. Nigeria is a single zone; the server runs UTC so we must not read local hours off `Date`. */
const TZ = "Africa/Lagos";

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayDiff(from: Date, to: Date): number {
    return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

function parseDate(iso: string): Date | null {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** Hour 0–23 and weekday 0–6 (Sun) in Africa/Lagos, independent of server locale. */
function lagosParts(d: Date): { hour: number; weekday: number } {
    try {
        const fmt = new Intl.DateTimeFormat("en-GB", {
            timeZone: TZ,
            hour: "2-digit",
            weekday: "short",
            hour12: false,
        });
        const parts = fmt.formatToParts(d);
        const hourRaw = parts.find((p) => p.type === "hour")?.value ?? "0";
        const weekdayRaw = parts.find((p) => p.type === "weekday")?.value ?? "";
        const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        let hour = parseInt(hourRaw, 10);
        if (hour === 24) hour = 0;
        return { hour, weekday: weekdayMap[weekdayRaw] ?? d.getUTCDay() };
    } catch {
        return { hour: d.getUTCHours(), weekday: d.getUTCDay() };
    }
}

function calendarDay(d: Date): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

function median(values: number[]): number | null {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export interface ExportFact {
    at: Date;
    type: "receipt" | "invoice" | "order";
    amount: number;
    currency: "NGN" | "USD";
}

/**
 * Merge export signals from BOTH sources into one deduplicated timeline.
 *
 * Why this is necessary: an authenticated merchant produces a `documents` row AND a
 * `doc_exported` telemetry event for the same action. Summing both inflates every
 * volume and frequency attribute by ~2x for exactly the cohort that matters most.
 *
 * Dedupe signature is `date|type|amount`. Limitation, stated honestly: two genuinely
 * identical same-day documents (same type, same amount) collapse into one, slightly
 * understating high-volume thin-margin sellers. Understating is the safer error than
 * doubling — and if a stable per-document id is ever added to the telemetry payload,
 * switch this to dedupe on that key and the approximation disappears.
 */
export function buildExportFacts(input: CustomerInput): ExportFact[] {
    const bySignature = new Map<string, ExportFact>();

    for (const doc of input.docs) {
        if (doc.deletedAt) continue;
        const at = parseDate(doc.createdAt);
        if (!at) continue;
        const type = eventDocType({ properties: { docType: doc.type } });
        const amount = Number.isFinite(doc.amount) ? doc.amount : 0;
        const currency: "NGN" | "USD" = String(doc.currency ?? "NGN").toUpperCase() === "USD" ? "USD" : "NGN";
        const sig = `${calendarDay(at)}|${type}|${Math.round(amount)}`;
        if (!bySignature.has(sig)) bySignature.set(sig, { at, type, amount, currency });
    }

    for (const ev of input.events) {
        if (ev.eventName !== EVENTS.DOC_EXPORTED) continue;
        const at = parseDate(ev.createdAt);
        if (!at) continue;
        const type = eventDocType(ev);
        const amount = eventAmount(ev);
        const currency = eventCurrency(ev);
        const sig = `${calendarDay(at)}|${type}|${Math.round(amount)}`;
        if (!bySignature.has(sig)) bySignature.set(sig, { at, type, amount, currency });
    }

    return [...bySignature.values()].sort((a, b) => a.at.getTime() - b.at.getTime());
}

function resolveContactable(phone?: string | null, email?: string | null): ContactChannel {
    if (phone && String(phone).replace(/\D/g, "").length >= 10) return "whatsapp";
    if (email && email.includes("@")) return "email";
    return "none";
}

function peakBandFromCounts(hourCounts: number[], weekendShare: number): PeakHourBand | null {
    if (hourCounts.reduce((a, b) => a + b, 0) === 0) return null;
    // Weekend trading is a strong enough signal in this market to outrank hour-of-day.
    if (weekendShare >= 0.35) return "weekend";
    const bands: Array<[PeakHourBand, number[]]> = [
        ["early-morning", [5, 6, 7, 8, 9]],
        ["midday", [10, 11, 12, 13, 14, 15]],
        ["evening", [16, 17, 18, 19, 20, 21]],
        ["late-night", [22, 23, 0, 1, 2, 3, 4]],
    ];
    let best: PeakHourBand | null = null;
    let bestCount = -1;
    for (const [band, hours] of bands) {
        const total = hours.reduce((sum, h) => sum + hourCounts[h], 0);
        if (total > bestCount) {
            bestCount = total;
            best = band;
        }
    }
    return best;
}

/** Compute every attribute from raw inputs. Deterministic given `now`. */
export function buildAttributes(input: CustomerInput, now: Date): CustomerAttributes {
    const events = input.events
        .map((e) => ({ event: e, at: parseDate(e.createdAt) }))
        .filter((x): x is { event: RawEvent; at: Date } => x.at !== null)
        .sort((a, b) => a.at.getTime() - b.at.getTime());

    const exports = buildExportFacts(input);

    const since = (days: number) => now.getTime() - days * DAY_MS;
    const w7 = since(7);
    const w30 = since(30);
    const w90 = since(90);

    // ── Recency / cadence ────────────────────────────────────────────────────
    const activityTimes: Date[] = [
        ...events.map((e) => e.at),
        ...exports.map((e) => e.at),
    ].sort((a, b) => a.getTime() - b.getTime());

    const firstSeen = activityTimes[0] ?? null;
    const lastSeen = activityTimes[activityTimes.length - 1] ?? null;

    const activityDays = [...new Set(activityTimes.map(calendarDay))].sort();
    const gaps: number[] = [];
    for (let i = 1; i < activityDays.length; i++) {
        gaps.push(dayDiff(new Date(activityDays[i - 1]), new Date(activityDays[i])));
    }

    // ── Exports by window ────────────────────────────────────────────────────
    let exports7d = 0;
    let exports30d = 0;
    let exports90d = 0;
    let volume30d = 0;
    let volume90d = 0;
    let volumeLifetime = 0;
    let docsUsd90d = 0;
    let receiptCount = 0;
    let invoiceCount = 0;
    let orderCount = 0;

    for (const ex of exports) {
        const t = ex.at.getTime();
        const ngn = ex.currency === "USD" ? ex.amount : ex.amount; // no FX applied; see note below
        if (t >= w7) exports7d++;
        if (t >= w30) { exports30d++; volume30d += ngn; }
        if (t >= w90) { exports90d++; volume90d += ngn; if (ex.currency === "USD") docsUsd90d++; }
        volumeLifetime += ngn;
        if (ex.type === "receipt") receiptCount++;
        else if (ex.type === "invoice") invoiceCount++;
        else orderCount++;
    }

    // NOTE: USD amounts are added to Naira totals without conversion, matching the
    // existing behaviour in `app/api/admin/overview/route.ts` so numbers reconcile
    // against the current dashboard. It understates cross-border value. Fixing it
    // means introducing an FX rate here AND in overview, or the two views disagree.

    const exportsLifetime = exports.length;

    // ── Second export within 7 days (the real activation metric) ─────────────
    const secondExportWithin7d =
        exports.length >= 2 && dayDiff(exports[0].at, exports[1].at) <= 7;

    // ── Sessions & channel ───────────────────────────────────────────────────
    let sessions30d = 0;
    let activityDays30dCount = 0;
    const activityDays30 = new Set<string>();
    const hourCounts = new Array(24).fill(0);
    let weekendEvents = 0;
    let pwaInstalled = false;
    let inAppWebview = false;
    let bankDetailsSaved = false;
    let platform = "Unknown";
    let paymentFailed = false;

    for (const { event, at } of events) {
        const t = at.getTime();
        if (isSessionEvent(event.eventName) && t >= w30) sessions30d++;
        if (t >= w30) activityDays30.add(calendarDay(at));

        const { hour, weekday } = lagosParts(at);
        hourCounts[hour]++;
        if (weekday === 0 || weekday === 6) weekendEvents++;

        if (event.device?.isPWA) pwaInstalled = true;
        if (event.device?.platform) platform = event.device.platform;
        if (event.device?.isInAppWebview) inAppWebview = true;
        if (event.eventName === EVENTS.PWA_INSTALLED) pwaInstalled = true;
        if (event.eventName === EVENTS.PAYMENT_FAILED) paymentFailed = true;
        if (event.properties?.hasBankDetails === true) bankDetailsSaved = true;
    }
    activityDays30dCount = activityDays30.size;

    const totalEvents = events.length;
    const weekendShare = totalEvents > 0 ? weekendEvents / totalEvents : 0;

    // ── Intent ───────────────────────────────────────────────────────────────
    let paywallViews7d = 0;
    let paywallViewsLifetime = 0;
    let proFeatureTaps30d = 0;
    let proFeatureTapsLifetime = 0;
    let logoTaps30d = 0;
    const gateVariants = new Set<string>();
    const proFeaturesUsed = new Set<string>();

    for (const { event, at } of events) {
        const t = at.getTime();
        if (event.eventName === EVENTS.UPGRADE_GATE_VIEWED) {
            paywallViewsLifetime++;
            if (t >= w7) paywallViews7d++;
            const v = eventGateVariant(event);
            if (v) gateVariants.add(v);
        }
        if (event.eventName === EVENTS.FEATURE_INTENT || event.eventName === EVENTS.PRO_FEATURE_BLOCKED) {
            proFeatureTapsLifetime++;
            if (t >= w30) proFeatureTaps30d++;
            const f = eventFeature(event);
            if (f === "logo_upload" && t >= w30) logoTaps30d++;
        }
        if (event.eventName === EVENTS.PRO_FEATURE_USED) {
            const f = eventFeature(event);
            if (f) proFeaturesUsed.add(f);
        }
        if (event.eventName === EVENTS.FEATURE_INTENT) {
            const f = eventFeature(event);
            if (f === "bank_vault") bankDetailsSaved = true;
        }
    }

    const subStatus = String(input.identity.subscriptionStatus ?? "").toLowerCase();
    if (subStatus.includes("past_due") || subStatus.includes("past-due") || subStatus.includes("unpaid") || subStatus.includes("failed")) {
        paymentFailed = true;
    }

    const receiptInvoiceOrder = receiptCount + invoiceCount + orderCount;

    return {
        daysSinceLast: lastSeen ? dayDiff(lastSeen, now) : null,
        daysSinceFirst: firstSeen ? dayDiff(firstSeen, now) : null,
        tenureDays: input.identity.createdAt
            ? Math.max(0, dayDiff(new Date(input.identity.createdAt), now))
            : firstSeen ? dayDiff(firstSeen, now) : 0,
        medianActivityGapDays: median(gaps),

        sessions30d,
        activityDays30d: activityDays30dCount,
        exports7d,
        exports30d,
        exports90d,
        exportsLifetime,
        receiptCount,
        invoiceCount,
        orderCount,
        receiptShare: receiptInvoiceOrder > 0 ? receiptCount / receiptInvoiceOrder : 0,

        volume30d,
        volume90d,
        volumeLifetime,
        docsUsd90d,
        avgDocValue: exportsLifetime > 0 ? Math.round(volumeLifetime / exportsLifetime) : 0,

        paywallViews7d,
        paywallViewsLifetime,
        proFeatureTaps30d,
        proFeatureTapsLifetime,
        logoTaps30d,
        gateVariants: [...gateVariants],
        proFeaturesUsed: [...proFeaturesUsed],

        secondExportWithin7d,
        pwaInstalled,
        bankDetailsSaved,

        platform,
        inAppWebview,
        peakHourBand: peakBandFromCounts(hourCounts, weekendShare),
        weekendActivity: weekendShare >= 0.35,
        contactable: resolveContactable(input.identity.phone, input.identity.email),

        paymentFailed,
    };
}