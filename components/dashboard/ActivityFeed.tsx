/**
 * components/dashboard/ActivityFeed.tsx
 */
"use client";

import { ActivityItem } from "@/lib/types";
import { FileText, Receipt, ShoppingBag } from "lucide-react";

interface ActivityFeedProps {
    items: ActivityItem[];
}

const TYPE_CONFIG = {
    receipt: { icon: Receipt, label: "Receipt", color: "text-green-600", bg: "bg-green-50" },
    invoice: { icon: FileText, label: "Invoice", color: "text-blue-600", bg: "bg-blue-50" },
    order: { icon: ShoppingBag, label: "Order", color: "text-purple-600", bg: "bg-purple-50" },
};

function formatAmount(amount: number, currency: string): string {
    if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
    return `$${amount.toLocaleString("en-US")}`;
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
    if (!items.length) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-surface-400 font-medium">
                    No documents generated yet
                </p>
                <p className="text-xs text-surface-300 mt-1">
                    Documents your team generates will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-surface-50">
            {items.map((item) => {
                const cfg = TYPE_CONFIG[item.type];
                const Icon = cfg.icon;

                return (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                        {/* Type icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                            <Icon size={16} className={cfg.color} />
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="text-xs font-black text-surface-900 truncate">
                                    {item.customerName || "Customer"}
                                </p>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                    {cfg.label}
                                </span>
                            </div>
                            <p className="text-[10px] text-surface-400 font-medium mt-0.5 truncate">
                                {item.creatorName
                                    ? `by ${item.creatorName}`
                                    : "by you"
                                } · {formatTime(item.createdAt)}
                            </p>
                        </div>

                        {/* Amount */}
                        <p className="text-sm font-black text-surface-900 flex-shrink-0">
                            {formatAmount(item.amount, item.currency)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}