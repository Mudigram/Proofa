"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Crown, Building2, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UpgradeVariant } from "@/hooks/useProGate";

// ─────────────────────────────────────────────────────────────────────────────
// Content per trigger variant
// ─────────────────────────────────────────────────────────────────────────────

const VARIANTS: Record<
    UpgradeVariant,
    { icon: React.ReactNode; headline: string; subtext: string; cta: string }
> = {
    export: {
        icon: <Zap size={22} className="text-primary-500" />,
        headline: "Remove watermark & export HD",
        subtext: "Send clean, branded receipts that build instant trust on WhatsApp.",
        cta: "Unlock Pro (₦2,500/mo)",
    },
    logo: {
        icon: <Crown size={22} className="text-primary-500" />,
        headline: "Upload your official business logo",
        subtext: "Vendors with logos look established. Protect your brand reputation.",
        cta: "Add Business Logo",
    },
    colors: {
        icon: <Crown size={22} className="text-primary-500" />,
        headline: "Match your custom brand colours",
        subtext: "Turn receipts into marketing assets that reflect your visual identity.",
        cta: "Unlock Brand Colours",
    },
    generic: {
        icon: <Zap size={22} className="text-primary-500" />,
        headline: "Elevate your business to Pro",
        subtext: "Issue clean, branded receipts and invoices with cloud backup.",
        cta: "Upgrade to Pro",
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
    variant: UpgradeVariant | null;
    onClose: () => void;
}

export function UpgradePrompt({ variant, onClose }: UpgradePromptProps) {
    const { isAuthenticated } = useAuth();
    const [selectedTier, setSelectedTier] = useState<"pro" | "business">("pro");
    const isOpen = variant !== null;
    const content = variant ? VARIANTS[variant] : null;

    if (!isOpen || !content) return null;

    const proUrl = isAuthenticated ? "/pricing?plan=pro" : "/auth/signup?from=/pricing?plan=pro";
    const bizUrl = isAuthenticated ? "/pricing?plan=business" : "/auth/signup?from=/pricing?plan=business";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-end justify-center px-3 pb-3 sm:pb-6 sm:items-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm"
                />

                {/* Bottom sheet / Modal */}
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 320 }}
                    className="relative z-10 w-full max-w-md bg-white dark:bg-surface-900 rounded-[2rem] shadow-2xl overflow-hidden border border-surface-200/80 dark:border-surface-800 p-5 sm:p-6"
                >
                    {/* Header bar */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                            <Crown size={12} />
                            Premium Feature
                        </div>

                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Headline */}
                    <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/60 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-500">
                            {content.icon}
                        </div>
                        <div>
                            <h2 className="text-base font-black text-surface-900 dark:text-surface-50 tracking-tight leading-snug">
                                {content.headline}
                            </h2>
                            <p className="text-xs text-surface-500 dark:text-surface-400 font-medium mt-0.5 leading-relaxed">
                                {content.subtext}
                            </p>
                        </div>
                    </div>

                    {/* Tier selector switcher */}
                    <div className="grid grid-cols-2 gap-2 my-4 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl border border-surface-200/60 dark:border-surface-700/60">
                        <button
                            type="button"
                            onClick={() => setSelectedTier("pro")}
                            className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                                selectedTier === "pro"
                                    ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-xs font-bold"
                                    : "text-surface-500 hover:text-surface-800 dark:hover:text-surface-200"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <Crown size={12} className="text-primary-500" /> Pro
                                </span>
                                <span className="text-[11px] font-mono font-bold text-primary-500">₦2,500</span>
                            </div>
                            <p className="text-[9px] text-surface-400 mt-0.5">Solo vendor · Logo &amp; No watermark</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedTier("business")}
                            className={`py-2 px-2.5 rounded-lg text-left transition-all ${
                                selectedTier === "business"
                                    ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-xs font-bold"
                                    : "text-surface-500 hover:text-surface-800 dark:hover:text-surface-200"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <Building2 size={12} className="text-amber-500" /> Business
                                </span>
                                <span className="text-[11px] font-mono font-bold text-amber-500">₦5,000</span>
                            </div>
                            <p className="text-[9px] text-surface-400 mt-0.5">Teams · Multi-device sync &amp; Staff</p>
                        </button>
                    </div>

                    {/* Tier Feature highlights */}
                    <div className="bg-surface-50 dark:bg-surface-800/40 rounded-xl p-3 mb-4 border border-surface-100 dark:border-surface-800">
                        {selectedTier === "pro" ? (
                            <ul className="space-y-1.5 text-xs text-surface-600 dark:text-surface-300">
                                <li className="flex items-center gap-2">
                                    <Check size={13} className="text-emerald-500 shrink-0" />
                                    <span>Remove all watermarks &amp; export in Ultra HD</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={13} className="text-emerald-500 shrink-0" />
                                    <span>Upload custom business logo &amp; brand colours</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={13} className="text-emerald-500 shrink-0" />
                                    <span>Bank account vault &amp; ₦ / $ currency toggle</span>
                                </li>
                            </ul>
                        ) : (
                            <ul className="space-y-1.5 text-xs text-surface-600 dark:text-surface-300">
                                <li className="flex items-center gap-2">
                                    <Check size={13} className="text-amber-500 shrink-0" />
                                    <span>Everything in Pro included</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={13} className="text-amber-500 shrink-0" />
                                    <span>Multi-device real-time sync (never lose sales records)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={13} className="text-amber-500 shrink-0" />
                                    <span>Shop Attendant Mode (staff issue receipts; only you see revenue)</span>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={selectedTier === "pro" ? proUrl : bizUrl}
                            onClick={onClose}
                            className={`flex-1 ${
                                selectedTier === "pro"
                                    ? "bg-primary-500 hover:bg-primary-600 shadow-primary-500/20"
                                    : "bg-gradient-to-r from-amber-500 to-primary-600 shadow-amber-500/20"
                            } text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all`}
                        >
                            <span>{selectedTier === "pro" ? "GET PRO (₦2,500/mo)" : "GET BUSINESS (₦5,000/mo)"}</span>
                            <ArrowRight size={14} />
                        </Link>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-3 text-xs font-bold text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors shrink-0"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
