"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/auth";
import { addBankAccount } from "@/lib/bank";
import {
    CheckCircle2,
    ArrowRight,
    Building2,
    WalletCards,
    Sparkles,
    Check,
    Phone,
    Globe,
    Crown,
    Loader2,
    Rocket
} from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const POPULAR_BANKS = [
    "GTBank",
    "Access Bank",
    "Zenith Bank",
    "Moniepoint",
    "OPay",
    "Kuda Bank",
    "First Bank",
    "UBA",
    "Fidelity Bank",
    "Stanbic IBTC"
];

const CURRENCIES = [
    { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "GBP", symbol: "£", label: "British Pound" },
    { code: "EUR", symbol: "€", label: "Euro" },
];

export default function WelcomePage() {
    const router = useRouter();
    const { user, profile, refreshProfile } = useAuth();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [businessName, setBusinessName] = useState("");
    const [phone, setPhone] = useState("");
    const [currency, setCurrency] = useState("NGN");

    // Bank states
    const [bankName, setBankName] = useState("GTBank");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    useEffect(() => {
        // Pre-fill business name from signup
        if (typeof window !== "undefined") {
            const cachedName = localStorage.getItem("proofa_onboarding_biz_name");
            if (cachedName) {
                setBusinessName(cachedName);
            } else if (profile?.businessName) {
                setBusinessName(profile.businessName);
            }
        }
    }, [profile]);

    // Save Step 1 (Business Identity)
    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (user) {
            await updateProfile(user.id, {
                business_name: businessName.trim() || "My Business",
                default_currency: currency,
            });
            await refreshProfile();
        }

        setIsLoading(false);
        setStep(2);
    };

    // Save Step 2 (Bank Vault)
    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (user && bankName && accountName && accountNumber) {
            await addBankAccount(user.id, {
                bankName: bankName.trim(),
                accountName: accountName.trim(),
                accountNumber: accountNumber.trim(),
            });
            // Cache locally for instant availability
            try {
                const vault = [{
                    id: `bank_${Date.now()}`,
                    userId: user.id,
                    bankName: bankName.trim(),
                    accountName: accountName.trim(),
                    accountNumber: accountNumber.trim(),
                }];
                localStorage.setItem("proofa_bank_vault", JSON.stringify(vault));
            } catch {}
        }

        setIsLoading(false);
        setStep(3);
    };

    const handleSkipBank = () => {
        setStep(3);
    };

    return (
        <main className="app-container min-h-screen pb-16 pt-8 flex flex-col justify-center bg-gradient-to-b from-orange-50/40 via-white to-surface-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 relative transition-colors duration-200">
            {/* Top Right Dark Mode Toggle */}
            <div className="absolute top-6 right-6 z-30">
                <ThemeToggle />
            </div>
            {/* Header & Step Indicator */}
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Image
                        src="/Logo/Proofa orange icon.png"
                        alt="Proofa Logo"
                        width={36}
                        height={36}
                        className="object-contain"
                        unoptimized
                    />
                </div>
                <h1 className="text-2xl font-black text-surface-900 dark:text-surface-50 tracking-tight font-heading">
                    Setup Your Business
                </h1>
                <p className="text-xs text-surface-500 dark:text-surface-400 font-medium mt-0.5">
                    Step {step} of 3 &bull; Takes less than 60 seconds
                </p>

                {/* Progress Bar */}
                <div className="w-48 h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full mx-auto mt-4 overflow-hidden flex">
                    <div
                        className="h-full bg-primary-500 transition-all duration-500"
                        style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-sm mx-auto bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 p-6 rounded-[2.5rem] shadow-xl shadow-surface-900/5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                                <Building2 size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-surface-900 dark:text-surface-50">1. Business Identity</h2>
                                <p className="text-xs text-surface-500 dark:text-surface-400">Appears at the top of your receipts</p>
                            </div>
                        </div>

                        <form onSubmit={handleStep1} className="flex flex-col gap-4">
                            <div>
                                <label className="text-[10px] font-black text-surface-700 dark:text-surface-300 uppercase tracking-widest mb-1 block">
                                    Business / Store Name
                                </label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="e.g. Amaka's Fashion Hub"
                                    required
                                    className="w-full px-4 py-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-surface-50 font-bold placeholder:text-surface-400 dark:placeholder:text-surface-600 focus:outline-none focus:border-primary-500 text-xs"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-surface-700 dark:text-surface-300 uppercase tracking-widest mb-1 block">
                                    WhatsApp Number (Optional)
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. 08012345678"
                                        className="w-full pl-11 pr-4 py-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-surface-50 font-bold placeholder:text-surface-400 dark:placeholder:text-surface-600 focus:outline-none focus:border-primary-500 text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-surface-700 dark:text-surface-300 uppercase tracking-widest mb-1.5 block">
                                    Default Currency
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CURRENCIES.map((c) => (
                                        <button
                                            key={c.code}
                                            type="button"
                                            onClick={() => setCurrency(c.code)}
                                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${currency === c.code
                                                ? "bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-900 dark:text-primary-300 font-bold"
                                                : "bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 font-medium"
                                                }`}
                                        >
                                            <span className="text-xs">{c.symbol} {c.code}</span>
                                            {currency === c.code && <Check size={14} className="text-primary-600 dark:text-primary-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all text-xs uppercase tracking-wider mt-2"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Continue to Bank Vault <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-sm mx-auto bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 p-6 rounded-[2.5rem] shadow-xl shadow-surface-900/5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                                <WalletCards size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-surface-900 dark:text-surface-50">2. Bank Vault (Payment Details)</h2>
                                <p className="text-xs text-surface-500 dark:text-surface-400">Insert into receipts with 1 tap</p>
                            </div>
                        </div>

                        <form onSubmit={handleStep2} className="flex flex-col gap-4">
                            <div>
                                <label className="text-[10px] font-black text-surface-700 dark:text-surface-300 uppercase tracking-widest mb-1 block">
                                    Bank Name
                                </label>
                                <select
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-surface-50 font-bold focus:outline-none focus:border-primary-500 text-xs"
                                >
                                    {POPULAR_BANKS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-surface-700 dark:text-surface-300 uppercase tracking-widest mb-1 block">
                                    Account Name
                                </label>
                                <input
                                    type="text"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="e.g. Amaka OKONKWO"
                                    className="w-full px-4 py-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-surface-50 font-bold placeholder:text-surface-400 dark:placeholder:text-surface-600 focus:outline-none focus:border-primary-500 text-xs"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-surface-700 dark:text-surface-300 uppercase tracking-widest mb-1 block">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="e.g. 0123456789"
                                    className="w-full px-4 py-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-surface-50 font-bold placeholder:text-surface-400 dark:placeholder:text-surface-600 focus:outline-none focus:border-primary-500 text-xs font-mono"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all text-xs uppercase tracking-wider mt-1"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Save Bank &amp; Finish Setup <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleSkipBank}
                                className="text-surface-400 dark:text-surface-500 font-bold text-xs hover:text-surface-600 dark:hover:text-surface-300 transition-colors py-1 text-center"
                            >
                                Skip bank setup for now
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-sm mx-auto text-center"
                    >
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                            <CheckCircle2 size={36} strokeWidth={2.5} />
                        </div>

                        <h2 className="text-2xl font-black text-surface-900 dark:text-surface-50 tracking-tight font-heading mb-1">
                            You&apos;re All Set! 🎉
                        </h2>
                        <p className="text-xs text-surface-500 dark:text-surface-400 font-medium mb-6">
                            Your merchant profile for <span className="font-bold text-surface-900 dark:text-surface-100">{businessName || "My Business"}</span> is ready.
                        </p>

                        {/* Live Sample Card */}
                        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 shadow-sm text-left mb-6">
                            <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3 mb-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-primary-600 dark:text-primary-400 tracking-widest">Sample Receipt</p>
                                    <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{businessName || "My Business"}</p>
                                </div>
                                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                                    PAID
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-surface-700 dark:text-surface-300">
                                <span>1x Designer Item</span>
                                <span>{currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "₦"}25,000</span>
                            </div>
                            {bankName && accountNumber && (
                                <p className="text-xs text-surface-400 dark:text-surface-500 font-medium mt-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                                    Pay to: {bankName} &bull; {accountNumber}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/"
                                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                            >
                                <Rocket size={16} /> Open Workspace &amp; Create Receipt
                            </Link>

                            <Link
                                href="/pricing"
                                className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-50 dark:hover:bg-surface-800 active:scale-[0.98] transition-all text-xs"
                            >
                                <Crown size={15} className="text-amber-500" /> Explore Pro Features
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
