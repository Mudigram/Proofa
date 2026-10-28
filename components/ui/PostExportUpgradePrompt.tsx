"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/telemetry";

interface PostExportUpgradePromptProps {
    isOpen: boolean;
    onClose: () => void;
    businessName?: string;
    docAmount?: number;
    docType?: string;
}

export function PostExportUpgradePrompt({
    isOpen,
    onClose,
    businessName,
    docAmount,
    docType = "receipt"
}: PostExportUpgradePromptProps) {
    const { isPro, isAuthenticated } = useAuth();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const hasDismissed = sessionStorage.getItem("proofa_dismiss_post_export_prompt");
            if (hasDismissed === "1") {
                setDismissed(true);
            }
        }
    }, []);

    const handleDismiss = () => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem("proofa_dismiss_post_export_prompt", "1");
        }
        setDismissed(true);
        onClose();
        trackEvent("upgrade_prompt_dismissed", { source: "post_export", docType });
    };

    // Don't show if already Pro or dismissed in this session
    if (isPro || dismissed || !isOpen) return null;

    const formattedAmount = docAmount && docAmount > 0
        ? `₦${Number(docAmount).toLocaleString()}`
        : null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-end justify-center px-3 pb-4 sm:pb-6 pointer-events-none">
                {/* Subtle backdrop click to dismiss */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                    className="fixed inset-0 bg-surface-950/40 backdrop-blur-[2px] pointer-events-auto"
                />

                {/* Compact, non-intrusive sheet (max height ~280px) */}
                <motion.div
                    initial={{ y: "100%", opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: "100%", opacity: 0, scale: 0.96 }}
                    transition={{ type: "spring", damping: 26, stiffness: 300 }}
                    className="relative z-10 w-full max-w-md bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto p-5 sm:p-6"
                >
                    {/* Top bar with success & close */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                            {docType} Ready
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 flex items-center justify-center transition-colors text-xs"
                            aria-label="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Headline with psychological trust anchor */}
                    <div className="mb-3">
                        <h3 className="text-base font-black text-surface-900 dark:text-surface-50 tracking-tight leading-snug">
                            {businessName ? `Make ${businessName} look 10x more trustworthy` : "Look more established on WhatsApp"}
                        </h3>
                        <p className="text-xs text-surface-500 dark:text-surface-400 font-medium mt-1 leading-relaxed">
                            {formattedAmount ? (
                                <>
                                    Your customer received a <span className="font-bold text-surface-800 dark:text-surface-200">{formattedAmount}</span> receipt with a watermark. Remove watermarks and add your official business logo for only <span className="font-bold text-primary-500">₦83/day</span>.
                                </>
                            ) : (
                                "Send clean, watermark-free receipts with your custom business logo to reassure buyers."
                            )}
                        </p>
                    </div>

                    {/* Value pills */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-surface-50 dark:bg-surface-800/60 rounded-xl p-2.5 flex items-center gap-2 border border-surface-100 dark:border-surface-800">
                            <Crown size={14} className="text-primary-500 shrink-0" />
                            <span className="text-[11px] font-bold text-surface-700 dark:text-surface-300 leading-tight">
                                Official Logo &amp; No Watermark
                            </span>
                        </div>
                        <div className="bg-surface-50 dark:bg-surface-800/60 rounded-xl p-2.5 flex items-center gap-2 border border-surface-100 dark:border-surface-800">
                            <Sparkles size={14} className="text-amber-500 shrink-0" />
                            <span className="text-[11px] font-bold text-surface-700 dark:text-surface-300 leading-tight">
                                Cloud History &amp; Multi-Currency
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={isAuthenticated ? "/pricing?plan=pro" : "/auth/signup?from=/pricing?plan=pro"}
                            onClick={handleDismiss}
                            className="flex-1 bg-gradient-to-r from-primary-500 to-amber-500 hover:opacity-95 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/20 active:scale-[0.98] transition-all tracking-wide"
                        >
                            <span>UPGRADE TO PRO (₦2,500/mo)</span>
                            <ArrowRight size={14} />
                        </Link>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="px-3 py-3 text-xs font-bold text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors shrink-0"
                        >
                            Keep Free
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
