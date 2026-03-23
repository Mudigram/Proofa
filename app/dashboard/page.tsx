/**
 * app/dashboard/page.tsx
 *
 * Business Plan dashboard — gated behind isBusiness.
 * Mobile-first, full data from useDashboard hook.
 */
"use client";

import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import MetricCards from "@/components/dashboard/Metriccards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import DailySummaryCard from "@/components/dashboard/DailySummaryCard";
import { DashboardPeriod } from "@/lib/types";
import { RefreshCw, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "7 days" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
];

// ─── Gate: not a Business user ───────────────────────────────────────────────

function UpgradeGate() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center gap-6">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center">
                <Lock size={28} className="text-surface-400" />
            </div>
            <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                    Business Dashboard
                </h2>
                <p className="text-sm text-surface-400 font-medium mt-2 leading-relaxed max-w-xs">
                    Track your revenue, monitor your team, and share daily summaries to WhatsApp.
                </p>
            </div>
            <Link
                href="/pricing"
                className="px-6 py-3 bg-surface-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
            >
                Upgrade to Business
            </Link>
        </div>
    );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
    return <div className={`bg-surface-100 rounded-xl animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
    return (
        <div className="px-4 py-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-40" />
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { isBusiness, isLoading: authLoading, profile } = useAuth();
    const {
        data,
        isLoading,
        error,
        period,
        setPeriod,
        refresh,
        currency,
    } = useDashboard();

    // Auth still loading
    if (authLoading) return <DashboardSkeleton />;

    // Not a Business user
    if (!isBusiness) return <UpgradeGate />;

    return (
        <main className="px-4 py-6 flex flex-col gap-6 max-w-md mx-auto">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                        Business Dashboard
                    </p>
                    <h1 className="text-2xl font-black uppercase tracking-tight leading-none mt-1">
                        {profile?.businessName ?? "My Business"}
                    </h1>
                </div>
                <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="w-9 h-9 bg-surface-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={`text-surface-400 ${isLoading ? "animate-spin" : ""}`}
                    />
                </button>
            </div>

            {/* Period selector */}
            <div className="flex gap-2 bg-surface-100 p-1.5 rounded-2xl">
                {PERIODS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.value
                            ? "bg-white text-primary-500 shadow-sm"
                            : "text-surface-400"
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                    <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
            )}

            {/* Loading */}
            {isLoading && !data ? (
                <DashboardSkeleton />
            ) : data ? (
                <>
                    {/* Metric cards */}
                    <MetricCards metrics={data.metrics} />

                    {/* Revenue chart */}
                    <div className="bg-surface-50 border border-surface-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                                Revenue — {data.metrics.periodLabel}
                            </p>
                            <span className="text-[10px] font-black text-surface-300 uppercase">
                                {currency}
                            </span>
                        </div>
                        <RevenueChart
                            data={data.chart}
                            period={period}
                            currency={currency}
                        />
                    </div>

                    {/* Daily summary share card */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                            Share today's summary
                        </p>
                        <DailySummaryCard metrics={data.metrics} />
                    </div>

                    {/* Activity feed */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                                Recent activity
                            </p>
                            <span className="text-[10px] text-surface-300 font-medium">
                                Last 20 docs
                            </span>
                        </div>
                        <div className="bg-white border border-surface-100 rounded-2xl px-4">
                            <ActivityFeed items={data.activity} />
                        </div>
                    </div>
                </>
            ) : null}

        </main>
    );
}