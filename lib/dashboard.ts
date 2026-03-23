/**
 * lib/dashboard.ts
 *
 * All Supabase queries for the Business Plan dashboard.
 * Uses the client-side supabase singleton — called from useDashboard hook.
 *
 * Views used (created in migration):
 *   - v_daily_revenue  → chart data
 *   - v_activity_log   → activity feed
 */
import { supabase } from "@/lib/supabase";
import {
    DashboardPeriod,
    DashboardMetrics,
    DailyRevenue,
    ActivityItem,
    DashboardData,
    DocumentType
} from "@/lib/types";

// ─── Date range helpers ───────────────────────────────────────────────────────

export interface DateRange {
    from: string; // ISO
    to: string;   // ISO
    label: string;
}

export function getDateRange(period: DashboardPeriod): DateRange {
    const now = new Date();
    const pad = (d: Date) => d.toISOString();

    switch (period) {
        case "today": {
            const from = new Date(now);
            from.setHours(0, 0, 0, 0);
            return { from: pad(from), to: pad(now), label: "Today" };
        }
        case "week": {
            const from = new Date(now);
            from.setDate(now.getDate() - 6);
            from.setHours(0, 0, 0, 0);
            return { from: pad(from), to: pad(now), label: "Last 7 days" };
        }
        case "month": {
            const from = new Date(now.getFullYear(), now.getMonth(), 1);
            return { from: pad(from), to: pad(now), label: "This month" };
        }
        case "year": {
            const from = new Date(now.getFullYear(), 0, 1);
            return { from: pad(from), to: pad(now), label: "This year" };
        }
    }
}

/** Previous period range for comparison (same duration, shifted back) */
function getPreviousRange(period: DashboardPeriod): DateRange {
    const now = new Date();
    const pad = (d: Date) => d.toISOString();

    switch (period) {
        case "today": {
            const from = new Date(now); from.setDate(now.getDate() - 1); from.setHours(0, 0, 0, 0);
            const to = new Date(now); to.setDate(now.getDate() - 1); to.setHours(23, 59, 59, 999);
            return { from: pad(from), to: pad(to), label: "Yesterday" };
        }
        case "week": {
            const from = new Date(now); from.setDate(now.getDate() - 13); from.setHours(0, 0, 0, 0);
            const to = new Date(now); to.setDate(now.getDate() - 7);
            return { from: pad(from), to: pad(to), label: "Previous 7 days" };
        }
        case "month": {
            const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            return { from: pad(from), to: pad(to), label: "Last month" };
        }
        case "year": {
            const from = new Date(now.getFullYear() - 1, 0, 1);
            const to = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
            return { from: pad(from), to: pad(to), label: "Last year" };
        }
    }
}

const pct = (curr: number, prev: number): number | null => {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch aggregated metrics for current + previous period */
async function fetchMetrics(
    ownerId: string,
    range: DateRange,
    prevRange: DateRange,
    currency: string
): Promise<DashboardMetrics> {

    // Current period
    const { data: curr } = await supabase
        .from("documents")
        .select("amount, type")
        .eq("owner_id", ownerId)
        .eq("currency", currency)
        .is("deleted_at", null)
        .gte("created_at", range.from)
        .lte("created_at", range.to);

    // Previous period (for % change)
    const { data: prev } = await supabase
        .from("documents")
        .select("amount")
        .eq("owner_id", ownerId)
        .eq("currency", currency)
        .is("deleted_at", null)
        .gte("created_at", prevRange.from)
        .lte("created_at", prevRange.to);

    const currDocs = curr ?? [];
    const prevDocs = prev ?? [];

    const totalRevenue = currDocs.reduce((s, d) => s + Number(d.amount), 0);
    const prevRevenue = prevDocs.reduce((s, d) => s + Number(d.amount), 0);
    const totalDocs = currDocs.length;
    const prevDocCount = prevDocs.length;

    // Top doc type by count
    const typeCounts = currDocs.reduce<Record<string, number>>((acc, d) => {
        acc[d.type] = (acc[d.type] ?? 0) + 1;
        return acc;
    }, {});
    const topDocType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as DocumentType | null;

    return {
        totalRevenue,
        totalDocs,
        avgDocValue: totalDocs > 0 ? Math.round(totalRevenue / totalDocs) : 0,
        topDocType,
        periodLabel: range.label,
        currency,
        revenueChange: pct(totalRevenue, prevRevenue),
        docCountChange: pct(totalDocs, prevDocCount),
    };
}

/** Fetch daily revenue data for chart */
async function fetchChartData(
    ownerId: string,
    range: DateRange,
    currency: string
): Promise<DailyRevenue[]> {
    const { data, error } = await supabase
        .from("v_daily_revenue")
        .select("day, currency, doc_count, total_amount, type")
        .eq("owner_id", ownerId)
        .eq("currency", currency)
        .gte("day", range.from.split("T")[0])
        .lte("day", range.to.split("T")[0])
        .order("day", { ascending: true });

    if (error || !data) return [];

    return data.map(row => ({
        day: row.day,
        currency: row.currency,
        docCount: Number(row.doc_count),
        totalAmount: Number(row.total_amount),
        type: row.type as DocumentType,
    }));
}

/** Fetch recent activity (last 20 docs) */
async function fetchActivity(
    ownerId: string,
    limit = 20
): Promise<ActivityItem[]> {
    const { data, error } = await supabase
        .from("v_activity_log")
        .select("id, owner_id, created_by, creator_name, type, amount, currency, customer_name, template, created_at")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !data) return [];

    return data.map(row => ({
        id: row.id,
        ownerId: row.owner_id,
        createdBy: row.created_by,
        creatorName: row.creator_name,
        type: row.type as DocumentType,
        amount: Number(row.amount),
        currency: row.currency,
        customerName: row.customer_name,
        template: row.template,
        createdAt: row.created_at,
    }));
}

/** Master fetch — called by useDashboard */
export async function fetchDashboardData(
    ownerId: string,
    period: DashboardPeriod,
    currency = "NGN"
): Promise<DashboardData> {
    const range = getDateRange(period);
    const prevRange = getPreviousRange(period);

    const [metrics, chart, activity] = await Promise.all([
        fetchMetrics(ownerId, range, prevRange, currency),
        fetchChartData(ownerId, range, currency),
        fetchActivity(ownerId),
    ]);

    return { metrics, chart, activity };
}

/** Save a document to Supabase (called after generating) */
export async function saveDocumentToCloud(params: {
    ownerId: string;
    createdBy: string;
    type: string;
    template: string;
    amount: number;
    currency: string;
    customerName?: string;
    customerPhone?: string;
    data: Record<string, unknown>;
}) {
    const { error } = await supabase.from("documents").insert({
        owner_id: params.ownerId,
        created_by: params.createdBy,
        type: params.type,
        template: params.template,
        amount: params.amount,
        currency: params.currency,
        customer_name: params.customerName ?? null,
        customer_phone: params.customerPhone ?? null,
        data: params.data,
    });

    if (error) console.error("[Dashboard] Failed to save document:", error);
    return !error;
}