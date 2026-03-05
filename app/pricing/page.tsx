"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Crown, Building2, Zap, Check, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// Plan Data
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
    {
        id: "business",
        name: "Business",
        icon: <Building2 size={22} />,
        monthlyPrice: 5000,
        annualPrice: 50000,
        annualSave: 10000,
        badge: null,
        color: "bg-surface-900 text-white",
        borderColor: "border-surface-900",
        ctaClass: "bg-surface-900 text-white hover:bg-black",
        features: [
            "Everything in Pro",
            "Multi-device sync",
            "Business dashboard",
            "Smart VAT / Tax assist",
            "Dedicated account manager",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        icon: <Crown size={22} />,
        monthlyPrice: 2000,
        annualPrice: 20000,
        annualSave: 4000,
        badge: "⭐ Most Popular",
        color: "bg-primary-500 text-white",
        borderColor: "border-primary-500",
        ctaClass: "bg-primary-500 text-white hover:bg-primary-600",
        features: [
            "Remove watermark",
            "HD export",
            "Logo upload",
            "Custom brand colors",
            "Bank account vault",
            "₦ / $ toggle",
            "Priority support",
        ],
    },
    {
        id: "free",
        name: "Free",
        icon: <Zap size={22} />,
        monthlyPrice: 0,
        annualPrice: 0,
        annualSave: 0,
        badge: null,
        color: "bg-white text-surface-900",
        borderColor: "border-surface-200",
        ctaClass: "bg-surface-100 text-surface-700 hover:bg-surface-200",
        features: [
            "All 3 document types",
            "2 templates",
            "WhatsApp sharing",
            "Basic PNG export",
            "\"Made with Proofa\" watermark",
        ],
    },
];

const formatPrice = (n: number) =>
    n === 0 ? "Free" : `₦${n.toLocaleString()}`;

// ─────────────────────────────────────────────────────────────────────────────
// Notify Me Modal (Paystack placeholder)
// ─────────────────────────────────────────────────────────────────────────────

function NotifyModal({
    plan,
    onClose,
    userEmail,
}: {
    plan: string;
    onClose: () => void;
    userEmail?: string;
}) {
    const [email, setEmail] = useState(userEmail || "");
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: save to Supabase waitlist table when ready
        // await supabase.from("waitlist").upsert({ email, plan })
        await new Promise((r) => setTimeout(r, 600));
        setDone(true);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="relative z-10 w-full max-w-md bg-white rounded-t-[2.5rem] p-8 pt-6 shadow-2xl"
            >
                <div className="w-10 h-1.5 bg-surface-200 rounded-full mx-auto mb-6" />
                {done ? (
                    <div className="text-center py-4">
                        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={28} className="text-white" />
                        </div>
                        <h2 className="text-xl font-extrabold text-surface-900 mb-2">You&apos;re on the list!</h2>
                        <p className="text-surface-400 text-sm">We&apos;ll notify you the moment {plan} payments go live.</p>
                        <button onClick={onClose} className="mt-6 text-primary-500 font-bold text-sm">Close</button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-500">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-surface-900">Get notified</h2>
                                <p className="text-surface-400 text-xs font-medium">Payments launching soon for {plan}</p>
                            </div>
                        </div>
                        <p className="text-surface-500 text-sm mb-6 mt-3">
                            We&apos;re setting up payments now. Drop your email and we&apos;ll reach out the moment it&apos;s live — with an early adopter discount.
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="w-full px-4 py-4 bg-surface-50 border-2 border-surface-100 rounded-2xl text-surface-900 font-medium placeholder:text-surface-300 focus:outline-none focus:border-primary-400 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-60"
                            >
                                {loading ? "Saving…" : "Notify Me When Ready"}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PricingPage() {
    const { profile, isAuthenticated } = useAuth();
    const [billing, setBilling] = useState<"monthly" | "annual">("annual");
    const [notifyPlan, setNotifyPlan] = useState<string | null>(null);

    const price = (plan: typeof PLANS[0]) =>
        billing === "annual" ? plan.annualPrice : plan.monthlyPrice;

    return (
        <main className="app-container py-8 pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                    <Crown size={12} /> Pro Plans
                </div>
                <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight mb-3">
                    Choose how professional<br />you want to look
                </h1>
                <p className="text-surface-400 text-sm font-medium max-w-xs mx-auto">
                    Used by 120+ small businesses across Lagos, Abuja & PH
                </p>
            </motion.div>

            {/* Billing toggle */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center bg-surface-100 rounded-2xl p-1.5 gap-1">
                    <button
                        onClick={() => setBilling("monthly")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billing === "monthly" ? "bg-white text-surface-900 shadow-sm" : "text-surface-400"}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBilling("annual")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${billing === "annual" ? "bg-white text-surface-900 shadow-sm" : "text-surface-400"}`}
                    >
                        Annual
                        <span className="bg-green-100 text-green-600 text-[9px] font-black px-1.5 py-0.5 rounded-full">SAVE 20%</span>
                    </button>
                </div>
            </div>

            {/* Plan cards */}
            <div className="flex flex-col gap-4 mb-10">
                {PLANS.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-[2rem] border-2 ${plan.id === "pro" ? "border-primary-400 shadow-xl shadow-primary-500/10" : "border-surface-200"} overflow-hidden`}
                    >
                        {/* Card header */}
                        <div className={`${plan.id === "pro" ? "bg-primary-500" : plan.id === "business" ? "bg-surface-900" : "bg-white"} px-6 pt-6 pb-5`}>
                            {plan.badge && (
                                <div className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-2">
                                    {plan.badge}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.id === "free" ? "bg-surface-100 text-surface-500" : "bg-white/20 text-white"}`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-black ${plan.id === "free" ? "text-surface-900" : "text-white"}`}>
                                            {plan.name}
                                        </h2>
                                        {billing === "annual" && plan.annualSave > 0 && (
                                            <p className="text-green-300 text-[10px] font-bold">
                                                Save ₦{plan.annualSave.toLocaleString()}/yr
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-extrabold ${plan.id === "free" ? "text-surface-900" : "text-white"}`}>
                                        {formatPrice(price(plan))}
                                    </div>
                                    {price(plan) > 0 && (
                                        <div className={`text-[10px] font-medium ${plan.id === "free" ? "text-surface-400" : "text-white/60"}`}>
                                            /{billing === "annual" ? "year" : "month"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white px-6 py-5">
                            <ul className="flex flex-col gap-2.5 mb-5">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-center gap-2.5 text-sm text-surface-700 font-medium">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.id === "free" ? "bg-surface-100" : "bg-primary-50"}`}>
                                            <Check size={11} className={plan.id === "free" ? "text-surface-400" : "text-primary-500"} strokeWidth={3} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            {plan.id === "free" ? (
                                <Link
                                    href="/"
                                    className="w-full bg-surface-100 text-surface-600 font-bold py-3.5 rounded-xl flex items-center justify-center text-sm active:scale-[0.98] transition-all"
                                >
                                    Continue Free
                                </Link>
                            ) : isAuthenticated && profile?.subscriptionPlan === plan.id ? (
                                <div className="w-full bg-green-50 text-green-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                                    <Check size={16} strokeWidth={3} /> Current Plan
                                </div>
                            ) : (
                                <button
                                    onClick={() => setNotifyPlan(plan.name)}
                                    className={`w-full ${plan.id === "pro" ? "bg-primary-500 text-white" : "bg-surface-900 text-white"} font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-all`}
                                >
                                    <Bell size={15} />
                                    Get Notified When Ready
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Social proof */}
            <div className="bg-surface-50 rounded-[2rem] p-6 text-center">
                <p className="text-surface-500 text-sm font-medium mb-3">
                    Trusted by small businesses sending professional receipts daily
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                    {["Lagos", "Abuja", "Port Harcourt", "Ibadan"].map((city) => (
                        <span key={city} className="text-[10px] font-black text-surface-400 uppercase tracking-widest bg-white border border-surface-200 px-3 py-1.5 rounded-full">
                            {city}
                        </span>
                    ))}
                </div>
            </div>

            {/* Notify modal */}
            {notifyPlan && (
                <NotifyModal
                    plan={notifyPlan}
                    onClose={() => setNotifyPlan(null)}
                    userEmail={profile?.email}
                />
            )}
        </main>
    );
}
