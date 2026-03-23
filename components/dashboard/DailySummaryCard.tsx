/**
 * components/dashboard/DailySummaryCard.tsx
 */
"use client";

import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { captureElementAsImage } from "@/lib/ExportUtils";
import { shareToWhatsApp } from "@/lib/ShareUtils";
import { DashboardMetrics } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface DailySummaryCardProps {
    metrics: DashboardMetrics;
}

function formatAmount(amount: number, currency: string): string {
    if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default function DailySummaryCard({ metrics }: DailySummaryCardProps) {
    const { profile } = useAuth();
    const [sharing, setSharing] = useState(false);
    const cardId = "daily-summary-capture";

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const handleShare = async () => {
        setSharing(true);
        try {
            const dataUrl = await captureElementAsImage(cardId);
            if (!dataUrl) return;

            // `message` is not part of WhatsAppShareOptions —
            // pass only the supported fields
            await shareToWhatsApp({
                dataUrl,
                docType: "sales summary",
                filename: `Proofa-summary-${Date.now()}.png`,
            });
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <div
                id={cardId}
                className="bg-surface-900 rounded-2xl p-5 text-white"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                            Daily summary
                        </p>
                        <p className="text-xs font-bold text-white/70 mt-0.5">{today}</p>
                    </div>
                    {profile?.logoUrl ? (
                        <img
                            src={profile.logoUrl}
                            alt="Logo"
                            className="w-10 h-10 rounded-xl object-contain bg-white/10"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                            <span className="text-white font-black text-sm italic">P</span>
                        </div>
                    )}
                </div>

                <p className="text-sm font-black uppercase tracking-tight mb-3">
                    {profile?.businessName ?? "My Business"}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-[9px] text-white/50 font-black uppercase tracking-wider">Revenue</p>
                        <p className="text-base font-black mt-1 leading-none">
                            {formatAmount(metrics.totalRevenue, metrics.currency)}
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-[9px] text-white/50 font-black uppercase tracking-wider">Docs</p>
                        <p className="text-base font-black mt-1 leading-none">
                            {metrics.totalDocs}
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-[9px] text-white/50 font-black uppercase tracking-wider">Avg</p>
                        <p className="text-base font-black mt-1 leading-none">
                            {formatAmount(metrics.avgDocValue, metrics.currency)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                        Powered by Proofa
                    </p>
                    <p className="text-[9px] text-white/30 font-bold">proofa.ng</p>
                </div>
            </div>

            <button
                onClick={handleShare}
                disabled={sharing}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-60"
            >
                {sharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                {sharing ? "Preparing..." : "Share to WhatsApp"}
            </button>
        </div>
    );
}