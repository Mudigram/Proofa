/**
 * components/dashboard/MetricCards.tsx
 */
"use client";

import { DashboardMetrics } from "@/lib/types";
import { TrendingUp, TrendingDown, FileText, Zap } from "lucide-react";

interface MetricCardsProps {
    metrics: DashboardMetrics;
}

function formatAmount(amount: number, currency: string): string {
    if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

// Accepts null — renders nothing when there's no previous period to compare
function ChangeBadge({ pct }: { pct: number | null }) {
    if (pct === null) return null;
    const up = pct >= 0;
    return (
        <span className={`flex items-center gap-0.5 text-[10px] font-black ${up ? "text-green-600" : "text-red-500"}`}>
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(pct)}%
        </span>
    );
}

export default function MetricCards({ metrics }: MetricCardsProps) {
    const cards = [
        {
            label: "Total revenue",
            value: formatAmount(metrics.totalRevenue, metrics.currency),
            // Pass the value as-is — ChangeBadge handles null gracefully
            sub: <ChangeBadge pct={metrics.revenueChange} />,
            icon: <Zap size={16} className="text-primary-500" />,
            accent: true,
        },
        {
            label: "Documents",
            value: metrics.totalDocs.toLocaleString(),
            sub: <ChangeBadge pct={metrics.docCountChange} />,
            icon: <FileText size={16} className="text-surface-400" />,
        },
        {
            label: "Avg value",
            value: formatAmount(metrics.avgDocValue, metrics.currency),
            sub: <span className="text-[10px] text-surface-400">per document</span>,
            icon: <FileText size={16} className="text-surface-400" />,
        },
        {
            label: "Top type",
            value: metrics.topDocType
                ? metrics.topDocType.charAt(0).toUpperCase() + metrics.topDocType.slice(1)
                : "—",
            sub: <span className="text-[10px] text-surface-400">most generated</span>,
            icon: <FileText size={16} className="text-surface-400" />,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`rounded-2xl p-4 flex flex-col gap-2 ${card.accent
                            ? "bg-primary-500 text-white"
                            : "bg-surface-50 border border-surface-100"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${card.accent ? "text-white/70" : "text-surface-400"
                            }`}>
                            {card.label}
                        </p>
                        {!card.accent && card.icon}
                    </div>
                    <p className={`text-xl font-black leading-none tracking-tight ${card.accent ? "text-white" : "text-surface-900"
                        }`}>
                        {card.value}
                    </p>
                    {card.sub}
                </div>
            ))}
        </div>
    );
}