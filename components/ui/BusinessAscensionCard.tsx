"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Users, Smartphone, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/telemetry";

interface BusinessAscensionCardProps {
    className?: string;
    source?: string;
}

export function BusinessAscensionCard({ className = "", source = "dashboard" }: BusinessAscensionCardProps) {
    const { isPro, isBusiness } = useAuth();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const isDismissed = localStorage.getItem("proofa_dismiss_business_ascension");
            if (isDismissed === "1") {
                setDismissed(true);
            }
        }
    }, []);

    // Only show to Pro users who have NOT yet upgraded to Business
    if (!isPro || isBusiness || dismissed) {
        return null;
    }

    const handleDismiss = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("proofa_dismiss_business_ascension", "1");
        }
        setDismissed(true);
        trackEvent("business_ascension_dismissed", { source });
    };

    return (
        <div className={`relative bg-gradient-to-br from-surface-900 via-[#18181b] to-surface-950 text-white p-5 sm:p-6 rounded-[2rem] border border-surface-800 shadow-xl overflow-hidden ${className}`}>
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Dismiss button */}
            <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-surface-400 hover:text-white flex items-center justify-center transition-colors text-xs"
                title="Dismiss"
            >
                <X size={14} />
            </button>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-3">
                <Building2 size={12} />
                Ascend to Proofa Business
            </div>

            {/* Headline */}
            <h3 className="text-lg font-black tracking-tight text-white mb-1.5">
                Selling from multiple phones or managing store staff?
            </h3>
            <p className="text-xs text-surface-300 font-medium leading-relaxed mb-4 max-w-xl">
                Upgrade from Pro to Business to give your staff access to issue receipts without seeing your profit margins, plus automatic multi-device cloud backup.
            </p>

            {/* Feature highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
                    <Smartphone size={16} className="text-primary-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-white leading-tight">Multi-Device Sync</p>
                        <p className="text-[10px] text-surface-400 mt-0.5">Real-time backup if a phone is lost or broken</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
                    <Users size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-white leading-tight">Shop Attendant Mode</p>
                        <p className="text-[10px] text-surface-400 mt-0.5">Staff issue receipts; only you see revenue &amp; profits</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-white leading-tight">Smart Tax / VAT Assist</p>
                        <p className="text-[10px] text-surface-400 mt-0.5">1-click audit-ready monthly summaries for FIRS</p>
                    </div>
                </div>
            </div>

            {/* Footer action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black font-mono text-white">₦5,000</span>
                    <span className="text-xs text-surface-400">/ month · or ₦50,000/yr (saves ₦10k)</span>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/pricing?plan=business"
                        className="bg-white text-surface-900 hover:bg-surface-100 font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                    >
                        <span>Upgrade to Business</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
