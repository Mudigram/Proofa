/*
  THESIS: This surface owns one idea — three versions of who the user's business could be.
  It refuses the standard SaaS feature-matrix grid and the generic "pricing hero" layout.

  OWN-WORLD: Burnt Orange (#e8590c) / Rich Charcoal (#1a1a1a) / Off-White Canvas (#fafafa).
  Outfit 900 for plan names and headline; Inter 700 for features and labels. Rounded-[2.5rem]
  cards, uppercase tracking-widest labels, active:scale-[0.98] on every CTA.

  GATEWAYS:
  - 🇳🇬 NGN payments powered by Paystack (Card, Transfer, USSD)
  - 🌐 USD international payments powered by Bachs (Global Cards)
*/
"use client";

import React, { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Crown,
  Building2,
  Zap,
  Check,
  Bell,
  Loader2,
  ArrowRight,
  X,
  Sparkles,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePaystack } from "@/hooks/usePaystack";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

// ─────────────────────────────────────────────────────────────────────────────
// Plan Data with NGN & USD pricing
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "business",
    name: "Business",
    icon: Building2,
    monthlyPriceNGN: 5000,
    annualPriceNGN: 50000,
    annualSaveNGN: 10000,
    monthlyPriceUSD: 10,
    annualPriceUSD: 100,
    annualSaveUSD: 20,
    badge: "For Teams",
    comingSoon: false,
    headline: "Built for teams.",
    features: [
      "Everything in Pro",
      "Multi-device sync",
      "Business dashboard",
      "Smart VAT / tax assist",
      "Dedicated account manager",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    monthlyPriceNGN: 2500,
    annualPriceNGN: 25000,
    annualSaveNGN: 5000,
    monthlyPriceUSD: 5,
    annualPriceUSD: 50,
    annualSaveUSD: 10,
    badge: "Most Popular",
    comingSoon: false,
    headline: "Own your brand.",
    features: [
      "Remove watermark",
      "HD image export",
      "Business logo upload",
      "Custom brand colours",
      "Bank account vault",
      "₦ / $ currency toggle",
      "Priority support",
    ],
  },
  {
    id: "free",
    name: "Free",
    icon: Zap,
    monthlyPriceNGN: 0,
    annualPriceNGN: 0,
    annualSaveNGN: 0,
    monthlyPriceUSD: 0,
    annualPriceUSD: 0,
    annualSaveUSD: 0,
    badge: null,
    comingSoon: false,
    headline: "Start today.",
    features: [
      "All 3 document types",
      "2 templates",
      "WhatsApp sharing",
      "Basic PNG export",
      '"Made with Proofa" watermark',
    ],
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

// Full comparison rows: [label, free, pro, business]
const COMPARISON_ROWS: [string, string | boolean, string | boolean, string | boolean][] = [
  ["Document types", "3", "3", "3"],
  ["Templates", "2 of 3", "All 3", "All 3"],
  ["WhatsApp sharing", true, true, true],
  ["PNG export", "Standard", "HD (2×)", "HD (2×)"],
  ["Watermark", '"Made with Proofa"', false, false],
  ["Business logo", false, true, true],
  ["Custom brand colours", false, true, true],
  ["Bank account vault", false, true, true],
  ["₦ / $ toggle", false, true, true],
  ["Receipt history", "20 docs (local)", "Unlimited (cloud)", "Unlimited (cloud)"],
  ["Multi-device sync", false, false, true],
  ["Business dashboard", false, false, true],
  ["VAT / tax assist", false, false, true],
  ["Support", "Community", "Priority", "Dedicated manager"],
];

const formatPrice = (n: number, curr: "NGN" | "USD") => {
  if (n === 0) return curr === "NGN" ? "₦0" : "$0";
  return curr === "NGN" ? `₦${n.toLocaleString()}` : `$${n.toLocaleString()}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Notify Me bottom sheet
// ─────────────────────────────────────────────────────────────────────────────

function NotifySheet({
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
    await new Promise((r) => setTimeout(r, 700));
    setDone(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8 sm:pb-0 sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-surface-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="w-10 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full mx-auto mt-4 mb-2" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 dark:text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="px-7 pb-10 pt-4">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/30">
                <Check size={30} className="text-white" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-black text-surface-900 dark:text-surface-50 tracking-tight mb-2">
                You&apos;re on the list!
              </h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm font-medium leading-relaxed">
                We&apos;ll notify you the moment {plan} payments go live — with an early-adopter discount.
              </p>
              <button
                onClick={onClose}
                className="mt-6 text-primary-500 font-bold text-sm"
              >
                Back to plans
              </button>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                <Bell size={11} />
                {plan} · Early Access
              </div>

              <h2 className="text-2xl font-black text-surface-900 dark:text-surface-50 tracking-tight leading-snug mb-3">
                Get notified when it&apos;s live
              </h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm font-medium leading-relaxed mb-6">
                Payments are launching soon. Drop your email and we&apos;ll reach
                out the moment it&apos;s ready.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl text-surface-900 dark:text-surface-50 font-medium placeholder:text-surface-300 dark:placeholder:text-surface-600 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Notify Me When Ready"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparison cell helper
// ─────────────────────────────────────────────────────────────────────────────

function CompCell({ value, isHighlight }: { value: string | boolean; isHighlight?: boolean }) {
  if (value === true) {
    return (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mx-auto ${isHighlight ? "bg-primary-500" : "bg-surface-200 dark:bg-surface-700"}`}>
        <Check size={11} className={isHighlight ? "text-white" : "text-surface-600 dark:text-surface-300"} strokeWidth={3} />
      </div>
    );
  }
  if (value === false) {
    return <span className="text-surface-200 dark:text-surface-700 text-base leading-none">—</span>;
  }
  return (
    <span className={`text-[11px] font-bold leading-tight ${isHighlight ? "text-primary-600 dark:text-primary-400" : "text-surface-600 dark:text-surface-300"}`}>
      {value}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp-style testimonial card
// ─────────────────────────────────────────────────────────────────────────────

function TestimonialCard({
  name,
  city,
  text,
  time,
  delay,
}: {
  name: string;
  city: string;
  text: string;
  time: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-surface-900 rounded-[1.5rem] shadow-sm border border-surface-100 dark:border-surface-800 overflow-hidden"
    >
      <div className="bg-surface-50 dark:bg-surface-800 border-b border-surface-100 dark:border-surface-800 px-4 py-2.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-600 font-black text-xs">{name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-surface-900 dark:text-surface-50 uppercase tracking-widest truncate">{name}</p>
          <p className="text-[10px] text-surface-400 dark:text-surface-500 font-medium">{city}</p>
        </div>
        <span className="text-[10px] text-surface-300 dark:text-surface-600 font-medium">{time}</span>
      </div>

      <div className="px-4 py-4">
        <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-full">
          <p className="text-sm text-surface-700 dark:text-surface-300 font-medium leading-relaxed">
            &ldquo;{text}&rdquo;
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Wrapper
// ─────────────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingPageContent />
    </Suspense>
  );
}

function PricingPageContent() {
  const { user, profile, isAuthenticated, plan, refreshProfile } = useAuth();
  const { initializePayment, loading: paystackLoading } = usePaystack();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [notifyPlan, setNotifyPlan] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const userId = profile?.id || user?.id;

  // Handle return callbacks from Bachs International Checkout
  useEffect(() => {
    const bachsStatus = searchParams?.get("bachs");
    const planParam = searchParams?.get("plan");
    const cycleParam = searchParams?.get("cycle");
    const sessionId = searchParams?.get("session_id");

    if (bachsStatus === "success" && userId) {
      setVerifying(true);
      fetch("/api/bachs/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          plan: planParam || "pro",
          cycle: cycleParam || "monthly",
          userId,
        }),
      })
        .then((r) => r.json())
        .then(async (res) => {
          if (res.success) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("proofa_cached_profile");
            }
            await refreshProfile();
            showToast(`Welcome to Proofa ${planParam?.toUpperCase() || "PRO"}! International payment activated.`, "success");
            router.replace("/profile?upgrade=success");
          } else {
            showToast(res.error || "Could not verify international session.", "error");
          }
        })
        .catch(() => {
          showToast("Network error verifying international payment.", "error");
        })
        .finally(() => setVerifying(false));
    } else if (bachsStatus === "cancel") {
      showToast("International checkout was cancelled.", "info");
    }
  }, [searchParams, userId, refreshProfile, router, showToast]);

  const getPrice = (p: (typeof PLANS)[number]) => {
    if (currency === "USD") {
      return billing === "annual" ? p.annualPriceUSD : p.monthlyPriceUSD;
    }
    return billing === "annual" ? p.annualPriceNGN : p.monthlyPriceNGN;
  };

  const getAnnualSavings = (p: (typeof PLANS)[number]) => {
    return currency === "USD" ? p.annualSaveUSD : p.annualSaveNGN;
  };

  const handleCTA = async (planObj: (typeof PLANS)[number]) => {
    if (planObj.id === "free") {
      router.push("/");
      return;
    }

    if (planObj.comingSoon) {
      setNotifyPlan(planObj.name);
      return;
    }

    if (!isAuthenticated) {
      router.push(`/auth/signup?from=/pricing&intent=${planObj.id}`);
      return;
    }

    const userEmail = profile?.email || user?.email;
    if (!userEmail || !userId) {
      showToast("Could not determine user account details. Please re-login.", "error");
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Route 1: International USD via Bachs
    // ─────────────────────────────────────────────────────────────────────────
    if (currency === "USD") {
      setVerifying(true);
      try {
        const res = await fetch("/api/bachs/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: planObj.id,
            billing,
            userId,
            email: userEmail,
            businessName: profile?.businessName || "Proofa Merchant",
          }),
        });

        const data = await res.json();

        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          showToast(data.error || "Failed to initialize Bachs international checkout.", "error");
          setVerifying(false);
        }
      } catch {
        showToast("Network error connecting to Bachs payment gateway.", "error");
        setVerifying(false);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Route 2: Nigerian NGN via Paystack
    // ─────────────────────────────────────────────────────────────────────────
    await initializePayment({
      email: userEmail,
      amount: getPrice(planObj),
      metadata: { userId, plan: planObj.id },
      onSuccess: async (reference) => {
        setVerifying(true);
        try {
          const res = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference, plan: planObj.id, userId }),
          });
          const data = await res.json();
          if (data.success) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("proofa_cached_profile");
            }
            await refreshProfile();
            showToast(`Successfully upgraded to ${planObj.name}!`, "success");
            router.push("/profile?upgrade=success");
          } else {
            showToast(`Verification failed: ${data.error || "Contact support."}`, "error");
          }
        } catch {
          showToast("Something went wrong during verification.", "error");
        } finally {
          setVerifying(false);
        }
      },
      onClose: () => {},
    });
  };

  const getCTALabel = (planObj: (typeof PLANS)[number]) => {
    if (planObj.id === "free") return "Continue Free";
    if (plan === planObj.id) return "Current Plan";
    if (planObj.comingSoon) return "Get Notified";
    if (!isAuthenticated) return `Get ${planObj.name}`;
    return `Upgrade to ${planObj.name}`;
  };

  const isCurrentPlan = (p: (typeof PLANS)[number]) => plan === p.id;

  return (
    <main className="app-container py-6 pb-44">

      {/* ── Hook ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-6 mt-2"
      >
        <h1 className="text-[2.25rem] font-black text-surface-900 dark:text-surface-50 tracking-tight leading-[1.05] mb-3">
          Make sure it says<br />
          <span className="text-primary-500">something good</span>
          <br />about your business.
        </h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm font-medium leading-relaxed max-w-[320px] mx-auto">
          Every receipt you send is a first impression. Pro makes your brand unforgettable.
        </p>
      </motion.div>

      {/* ── Social proof strip ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-center gap-3 mb-6"
      >
        <div className="flex -space-x-2">
          {["T", "E", "A", "O"].map((letter, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-primary-100 border-2 border-white dark:border-surface-950 flex items-center justify-center"
            >
              <span className="text-primary-700 font-black text-[9px]">{letter}</span>
            </div>
          ))}
        </div>
        <p className="text-surface-500 dark:text-surface-400 text-xs font-medium">
          <span className="font-black text-surface-900 dark:text-surface-50">240+</span> businesses already look more professional
        </p>
      </motion.div>

      {/* ── Regional Gateway & Currency Switcher ─────────────────────────── */}
      <div className="flex flex-col items-center gap-2.5 mb-6">
        <div className="inline-flex items-center bg-surface-100 dark:bg-surface-800 rounded-2xl p-1 gap-1 border border-surface-200 dark:border-surface-800 shadow-xs">
          <button
            id="currency-ngn"
            onClick={() => setCurrency("NGN")}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              currency === "NGN"
                ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm"
                : "text-surface-500 hover:text-surface-900 dark:hover:text-surface-100"
            }`}
          >
            <span>🇳🇬</span> NGN (Paystack)
          </button>
          <button
            id="currency-usd"
            onClick={() => setCurrency("USD")}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              currency === "USD"
                ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm"
                : "text-surface-500 hover:text-surface-900 dark:hover:text-surface-100"
            }`}
          >
            <span>🌐</span> USD (Bachs)
          </button>
        </div>

        {/* ── Billing Cycle (Monthly / Annual) ───────────────────────────── */}
        <div className="inline-flex items-center bg-surface-100/70 dark:bg-surface-800/70 rounded-2xl p-1 gap-1 border border-surface-200/60 dark:border-surface-800">
          <button
            id="billing-monthly"
            onClick={() => setBilling("monthly")}
            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              billing === "monthly"
                ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm"
                : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50"
            }`}
          >
            Monthly
          </button>
          <button
            id="billing-annual"
            onClick={() => setBilling("annual")}
            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
              billing === "annual"
                ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm"
                : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-50"
            }`}
          >
            Annual
            <span className="bg-primary-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full font-mono">
              −20%
            </span>
          </button>
        </div>
      </div>

      {/* ── Plan cards ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-8">
        {PLANS.map((planObj, i) => {
          const Icon = planObj.icon;
          const isBusiness = planObj.id === "business";
          const isPro = planObj.id === "pro";
          const isFree = planObj.id === "free";
          const isCurrent = isCurrentPlan(planObj);
          const loading = (paystackLoading || verifying) && !planObj.comingSoon;
          const priceValue = getPrice(planObj);
          const savings = getAnnualSavings(planObj);

          return (
            <motion.div
              key={planObj.id}
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-[2rem] overflow-hidden ${
                isPro
                  ? "shadow-2xl shadow-primary-500/15 ring-2 ring-primary-400/50 z-10"
                  : isBusiness
                  ? "shadow-lg"
                  : "shadow-sm border border-surface-200 dark:border-surface-800"
              }`}
              style={isPro ? { transform: "scale(1.015)" } : undefined}
            >
              {/* Card header */}
              <div
                className={`px-6 pt-6 pb-5 ${
                  isPro
                    ? "bg-primary-500"
                    : isBusiness
                    ? "bg-surface-900 dark:bg-surface-800"
                    : "bg-white dark:bg-surface-900"
                }`}
              >
                {/* Badge row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isFree
                          ? "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300"
                          : "bg-white/15 text-white"
                      }`}
                    >
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2
                        className={`text-base font-black tracking-tight ${
                          isFree ? "text-surface-900 dark:text-surface-50" : "text-white"
                        }`}
                      >
                        {planObj.name}
                      </h2>
                      <p
                        className={`text-xs font-medium ${
                          isFree ? "text-surface-600 dark:text-surface-300" : "text-white/75"
                        }`}
                      >
                        {planObj.headline}
                      </p>
                    </div>
                  </div>

                  {planObj.badge && (
                    <div
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        isPro
                          ? "bg-white/20 text-white"
                          : "bg-surface-700 text-surface-200"
                      }`}
                    >
                      {planObj.badge}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-end gap-1.5">
                    <span
                      className={`text-4xl font-black tracking-tight leading-none font-mono ${
                        isFree ? "text-surface-900 dark:text-surface-50" : "text-white"
                      }`}
                    >
                      {formatPrice(priceValue, currency)}
                    </span>
                    {priceValue > 0 && (
                      <span
                        className={`text-sm font-medium mb-0.5 ${
                          isFree ? "text-surface-600 dark:text-surface-300" : "text-white/70"
                        }`}
                      >
                        /{billing === "annual" ? "yr" : "mo"}
                      </span>
                    )}
                  </div>
                  {billing === "annual" && savings > 0 && (
                    <p
                      className={`text-xs font-bold mt-1 font-mono ${
                        isPro ? "text-white/90" : "text-surface-700 dark:text-surface-300"
                      }`}
                    >
                      Save {formatPrice(savings, currency)} with annual billing
                    </p>
                  )}
                  {billing === "monthly" && priceValue > 0 && (
                    <p
                      className={`text-xs font-medium mt-1 font-mono ${
                        isPro ? "text-white/80" : "text-surface-700 dark:text-surface-300"
                      }`}
                    >
                      Switch to annual to save {formatPrice(savings, currency)}/yr
                    </p>
                  )}
                </div>
              </div>

              {/* Features + CTA */}
              <div className="bg-white dark:bg-surface-900 px-6 py-5">
                <ul className="flex flex-col gap-2.5 mb-5">
                  {planObj.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-sm text-surface-700 dark:text-surface-300 font-medium"
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isFree ? "bg-surface-100 dark:bg-surface-800" : "bg-primary-50 dark:bg-primary-950/60"
                        }`}
                      >
                        <Check
                          size={10}
                          strokeWidth={3}
                          className={isFree ? "text-surface-400" : "text-primary-500"}
                        />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Gateway Indicator */}
                {!isFree && (
                  <div className="text-[10px] font-mono text-surface-400 dark:text-surface-500 flex items-center gap-1.5 mb-3 px-1">
                    <Globe size={11} className="text-primary-500" />
                    <span>Processed securely via {currency === "USD" ? "Bachs (USD Cards)" : "Paystack (NGN & Bank Transfer)"}</span>
                  </div>
                )}

                {/* CTA */}
                {isCurrent ? (
                  <div className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm">
                    <Check size={15} strokeWidth={3} className="text-primary-500" />
                    Current Plan
                  </div>
                ) : isFree ? (
                  <Link
                    href="/"
                    id="cta-free"
                    className="w-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-bold py-3.5 rounded-2xl flex items-center justify-center text-sm active:scale-[0.98] transition-all hover:bg-surface-200 dark:hover:bg-surface-700"
                  >
                    Continue Free
                  </Link>
                ) : (
                  <button
                    id={`cta-${planObj.id}`}
                    onClick={() => handleCTA(planObj)}
                    disabled={loading}
                    className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-all disabled:opacity-70 ${
                      isPro
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600"
                        : "bg-surface-900 dark:bg-surface-50 text-white dark:text-surface-900 hover:bg-black dark:hover:bg-white"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {verifying ? "Verifying…" : "Redirecting…"}
                      </>
                    ) : planObj.comingSoon ? (
                      <>
                        <Bell size={15} />
                        Get Notified
                      </>
                    ) : (
                      <>
                        {isPro ? <Crown size={15} /> : <Sparkles size={15} />}
                        {getCTALabel(planObj)}
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Feature comparison toggle ─────────────────────────────────────── */}
      <div className="mb-10 flex flex-col items-center">
        <button
          id="compare-toggle"
          onClick={() => setShowComparison((v) => !v)}
          className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-surface-700 dark:text-surface-300 hover:text-surface-900 bg-surface-100/80 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl px-6 py-3.5 transition-all active:scale-[0.98]"
        >
          <span>{showComparison ? "Hide" : "Compare"} all features</span>
          <motion.div
            animate={{ rotate: showComparison ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ArrowRight size={14} className="rotate-90 text-primary-500" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden w-full mt-3"
            >
              <div className="bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-100 dark:border-surface-800 overflow-hidden shadow-sm">
                <div className="grid grid-cols-4 border-b border-surface-100 dark:border-surface-800">
                  <div className="p-4 col-span-1" />
                  {[
                    { label: "Free", style: "text-surface-500" },
                    { label: "Pro", style: "text-primary-500" },
                    { label: "Biz", style: "text-surface-700 dark:text-surface-300" },
                  ].map(({ label, style }) => (
                    <div
                      key={label}
                      className={`p-4 text-center text-[10px] font-black uppercase tracking-widest ${style}`}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {COMPARISON_ROWS.map(([label, free, pro, biz], rowIdx) => (
                  <div
                    key={label}
                    className={`grid grid-cols-4 border-b border-surface-50 dark:border-surface-800/60 last:border-0 ${
                      rowIdx % 2 === 0 ? "bg-white dark:bg-surface-900" : "bg-surface-50/40 dark:bg-surface-800/30"
                    }`}
                  >
                    <div className="p-3 pl-4 col-span-1">
                      <span className="text-[11px] font-bold text-surface-600 dark:text-surface-300 leading-tight">
                        {label}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-center">
                      <CompCell value={free} />
                    </div>
                    <div className="p-3 flex items-center justify-center bg-primary-50/30 dark:bg-primary-950/20">
                      <CompCell value={pro} isHighlight />
                    </div>
                    <div className="p-3 flex items-center justify-center">
                      <CompCell value={biz} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-surface-600 dark:text-surface-400 mb-5">
          What sellers are saying
        </p>
        <div className="flex flex-col gap-3">
          <TestimonialCard
            name="Tolani A."
            city="Lagos"
            text="Finally an app that doesn't make my receipts look like a generic WhatsApp message. The Pro branding is worth every naira!"
            time="10:42 AM"
            delay={0}
          />
          <TestimonialCard
            name="Temitope O."
            city="Ibadan"
            text="The bank vault saves me so much time. I just tap and my account details are there — no more typing and making errors."
            time="2:15 PM"
            delay={0.06}
          />
          <TestimonialCard
            name="Emeka C."
            city="Ife"
            text="Makes my freelance invoicing look way more professional. Clients actually pay faster when the invoice looks clean."
            time="Yesterday"
            delay={0.12}
          />
        </div>
      </div>

      {/* ── City proof banner ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="bg-surface-900 rounded-[2.5rem] p-8 text-center text-white relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-primary-500/20 blur-[70px] rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/10 blur-[50px] rounded-full -ml-8 -mb-8 pointer-events-none" />

        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-4 relative z-10">
          Trusted across Nigeria &amp; West Africa
        </p>
        <div className="flex justify-center gap-2 flex-wrap relative z-10">
          {["Lagos", "Abuja", "PH City", "Ibadan", "Accra", "Nairobi", "London"].map((city) => (
            <span
              key={city}
              className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full"
            >
              {city}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <div className="text-center">
        {!isAuthenticated ? (
          <>
            <Link
              href="/auth/signup?from=/pricing"
              id="cta-footer-signup"
              className="inline-flex items-center gap-2 bg-primary-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-primary-500/25 active:scale-[0.98] transition-all hover:bg-primary-600 text-sm"
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
            <p className="text-[10px] text-surface-400 font-medium mt-3">
              No credit card needed · Upgrade anytime
            </p>
          </>
        ) : (
          <Link
            href="/"
            className="text-surface-400 text-sm font-medium hover:text-surface-700 transition-colors"
          >
            Back to home
          </Link>
        )}
      </div>

      {/* ── Notify sheet ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {notifyPlan && (
          <NotifySheet
            plan={notifyPlan}
            onClose={() => setNotifyPlan(null)}
            userEmail={profile?.email}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
