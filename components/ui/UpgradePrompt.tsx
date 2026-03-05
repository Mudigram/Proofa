"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Crown } from "lucide-react";
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
        icon: <Zap size={28} className="text-primary-500" />,
        headline: "Remove watermark & export HD",
        subtext:
            "Your customers notice the difference. Send clean, branded receipts that build trust.",
        cta: "Make My Business Look Pro",
    },
    logo: {
        icon: <Crown size={28} className="text-primary-500" />,
        headline: "Logo upload is available in Pro",
        subtext:
            "Put your brand front and center. Businesses with logos look more established.",
        cta: "Add My Brand Logo",
    },
    colors: {
        icon: <Crown size={28} className="text-primary-500" />,
        headline: "Unlock brand customization",
        subtext:
            "Match your receipts to your business brand. Your identity, your colors.",
        cta: "Unlock My Brand Colors",
    },
    generic: {
        icon: <Zap size={28} className="text-primary-500" />,
        headline: "Make your business look more professional",
        subtext:
            "Upgrade to Pro and send branded, watermark-free receipts. Look more credible. Build customer trust.",
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
    const isOpen = variant !== null;
    const content = variant ? VARIANTS[variant] : null;

    return (
        <AnimatePresence>
            {isOpen && content && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm"
                    />

                    {/* Bottom sheet */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 28, stiffness: 320 }}
                        className="relative z-10 w-full max-w-md bg-white rounded-t-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Drag handle */}
                        <div className="w-10 h-1.5 bg-surface-200 rounded-full mx-auto mt-4 mb-2" />

                        {/* Dismiss */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-surface-100 flex items-center justify-center text-surface-400 hover:text-surface-700 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="px-7 pb-10 pt-4">
                            {/* Pro badge */}
                            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                                <Crown size={12} />
                                Pro Feature
                            </div>

                            {/* Icon + Headline */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    {content.icon}
                                </div>
                                <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight leading-snug mt-1">
                                    {content.headline}
                                </h2>
                            </div>

                            <p className="text-surface-500 text-sm font-medium leading-relaxed mb-7">
                                {content.subtext}
                            </p>

                            {/* Social proof */}
                            <div className="bg-surface-50 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {["🟠", "🔵", "🟢"].map((c, i) => (
                                        <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-surface-100 flex items-center justify-center text-xs">
                                            {c}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-surface-500 text-xs font-medium">
                                    <span className="font-bold text-surface-800">120+ businesses</span> already look more professional
                                </p>
                            </div>

                            {/* CTA */}
                            {isAuthenticated ? (
                                /* Signed in → go straight to pricing */
                                <Link
                                    href="/pricing"
                                    onClick={onClose}
                                    className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                                >
                                    {content.cta}
                                </Link>
                            ) : (
                                /* Not signed in → account first, then pricing */
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href={`/auth/signup?from=/pricing`}
                                        onClick={onClose}
                                        className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                                    >
                                        Create Free Account First
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        onClick={onClose}
                                        className="w-full bg-surface-100 text-surface-700 font-bold py-3.5 rounded-2xl flex items-center justify-center text-sm active:scale-[0.98] transition-all"
                                    >
                                        I already have an account
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
