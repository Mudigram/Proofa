"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, LogOut, ChevronRight, Crown, Settings, WalletCards, ShieldCheck, HelpCircle, MessageCircle, CheckCircle2, Copy, Check } from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

import { SavedBankAccount } from "@/lib/types";
import { getBankAccounts } from "@/lib/bank";

export default function ProfilePage() {
    const { user, profile, isPro, plan, signOut, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [vaultAccounts, setVaultAccounts] = useState<SavedBankAccount[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const cached = localStorage.getItem("proofa_bank_vault");
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) setVaultAccounts(parsed);
                } catch {}
            }
        }
        if (user?.id) {
            getBankAccounts(user.id).then(({ data }) => {
                if (data && data.length > 0) {
                    setVaultAccounts(data);
                    localStorage.setItem("proofa_bank_vault", JSON.stringify(data));
                }
            });
        }
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const handleCopyEmail = () => {
        if (!user?.email) return;
        navigator.clipboard.writeText(user.email);
        setCopiedEmail(true);
        showToast("Email copied to clipboard! 📋", "success");
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    if (isLoading) {
        return (
            <main className="app-container min-h-screen pb-24 pt-8 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-2 border-surface-200 border-t-primary-500 animate-spin" aria-label="Loading profile" />
            </main>
        );
    }

    // If not authenticated, show a prompt to sign in
    if (!isAuthenticated) {
        return (
            <main className="app-container min-h-screen pb-24 pt-8">
                <div className="h-full flex flex-col items-center justify-center pt-20 text-center">
                    <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center text-surface-600 mb-6">
                        <User size={36} aria-hidden="true" />
                    </div>
                    <h1 className="text-xl font-bold text-surface-900 mb-2 tracking-tight">Merchant Hub</h1>
                    <p className="text-surface-500 text-xs mb-8 px-8 leading-relaxed">
                        Sign in to save your receipts, manage bank details, and upgrade branding.
                    </p>
                    <Link
                        href="/auth/signup"
                        className="bg-primary-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-sm active:scale-95 transition-all text-xs mb-3 block w-full max-w-xs mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                        Create Free Account
                    </Link>
                    <Link
                        href="/auth/login"
                        className="bg-white text-surface-700 border border-surface-200 font-bold py-3.5 px-8 rounded-xl active:scale-95 transition-all text-xs block w-full max-w-xs mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    // Live status & merchant readiness calculation
    const p = profile as any;
    const hasBank = Boolean(p?.bankDetails?.bankName || p?.bankName || vaultAccounts.length > 0);
    const activeBankName = vaultAccounts[0]?.bankName || p?.bankDetails?.bankName || p?.bankName;
    const hasLogo = Boolean(profile?.logoUrl);
    const hasBusinessName = Boolean(profile?.businessName);

    const completedSteps = [hasBusinessName, hasBank, hasLogo].filter(Boolean).length;
    const setupPercentage = Math.round((completedSteps / 3) * 100);

    const bankSnippet = hasBank
        ? `${activeBankName} active • Ready for transfers 💸`
        : isPro
            ? "Manage saved account details"
            : "Manage saved account details (Pro)";

    const brandSnippet = hasLogo
        ? `Logo set • Default ${profile?.defaultCurrency || "NGN"}`
        : `Colors, Logo & Currency (${profile?.defaultCurrency || "NGN"})`;

    const accountSnippet = hasBusinessName
        ? `${profile?.businessName}`
        : user?.email || "Edit profile and business name";

    return (
        <main className="app-container min-h-screen pb-32 pt-8">
            {/* Merchant Header */}
            <header className="mb-6 text-center">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 border border-surface-200/60 shadow-sm relative">
                    <Image
                        src="/Logo/Proofa orange icon.png"
                        alt="Proofa Logo"
                        width={36}
                        height={36}
                        className="object-contain"
                        unoptimized
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold" title="Engine Active">
                        ✓
                    </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                    ⚡ Receipt Engine Active
                </div>
                <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Merchant Hub</h1>
                <p className="text-xs text-surface-400 font-medium mt-0.5">Manage business identity &amp; bank vault</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
            >
                {/* User / Business Card */}
                <div className="bg-white rounded-2xl p-5 border border-surface-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="w-14 h-14 bg-surface-100 text-surface-700 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl">
                        {profile?.businessName?.[0]?.toUpperCase() || profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User size={22} aria-hidden="true" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-base font-bold text-surface-900 truncate">
                                {profile?.businessName || profile?.name || "Business Owner"}
                            </h2>
                        </div>
                        <button
                            onClick={handleCopyEmail}
                            className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-700 transition-colors mt-0.5 group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                            title="Click to copy email"
                        >
                            <span className="truncate">{user?.email}</span>
                            {copiedEmail ? (
                                <Check size={12} className="text-emerald-500 shrink-0" aria-hidden="true" />
                            ) : (
                                <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
                            )}
                        </button>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-100 text-surface-600 text-[10px] font-bold uppercase tracking-wider rounded mt-1.5">
                            {plan === "business" ? "BUSINESS TIER" : isPro ? "PRO TIER" : "FREE TIER"}
                        </div>
                    </div>
                </div>

                {/* Setup Readiness Progress Bar */}
                <div className="bg-white rounded-2xl p-4 border border-surface-200/60 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-surface-700">Receipt Readiness</span>
                        <span className="text-xs font-bold text-emerald-600">{completedSteps}/3 Ready ({setupPercentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                            style={{ width: `${setupPercentage}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-surface-500">
                        <span className={`flex items-center gap-1 ${hasBusinessName ? "text-emerald-600 font-semibold" : ""}`}>
                            <CheckCircle2 size={12} className={hasBusinessName ? "text-emerald-500" : "text-surface-300"} aria-hidden="true" /> Business
                        </span>
                        <span className={`flex items-center gap-1 ${hasBank ? "text-emerald-600 font-semibold" : ""}`}>
                            <CheckCircle2 size={12} className={hasBank ? "text-emerald-500" : "text-surface-300"} aria-hidden="true" /> Bank Vault
                        </span>
                        <span className={`flex items-center gap-1 ${hasLogo ? "text-emerald-600 font-semibold" : ""}`}>
                            <CheckCircle2 size={12} className={hasLogo ? "text-emerald-500" : "text-surface-300"} aria-hidden="true" /> Logo
                        </span>
                    </div>
                </div>

                {/* Plan Status Card */}
                <div className="bg-white rounded-2xl p-5 border border-surface-200/60 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">Current Plan</span>
                            {isPro && <Crown size={13} className="text-amber-500 fill-amber-500" aria-hidden="true" />}
                        </div>
                        <h3 className="text-lg font-bold capitalize tracking-tight text-surface-900">
                            {plan}
                        </h3>
                        {!isPro && (
                            <p className="text-xs text-surface-500 font-normal mt-0.5">
                                Upgrade to add logos, brand colors, and bank vault.
                            </p>
                        )}
                    </div>

                    {!isPro ? (
                        <Link
                            href="/pricing"
                            className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shrink-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                            Upgrade
                        </Link>
                    ) : (
                        <Link
                            href="/pricing"
                            className="bg-white border border-surface-200 text-surface-700 hover:bg-surface-50 text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                            Manage
                        </Link>
                    )}
                </div>

                {/* Settings Links */}
                <div className="bg-white rounded-2xl p-2 border border-surface-200/60 shadow-sm">
                    <div className="flex flex-col">
                        <Link href="/profile/vault" className="flex items-center p-3.5 hover:bg-surface-50 rounded-xl transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                            <div className="w-9 h-9 bg-surface-100 text-surface-700 rounded-lg flex items-center justify-center mr-3.5 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <WalletCards size={18} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-surface-900 text-sm">Bank Vault</h4>
                                <p className="text-xs text-surface-500 mt-0.5 truncate">{bankSnippet}</p>
                            </div>
                            <ChevronRight size={16} className="text-surface-300" aria-hidden="true" />
                        </Link>

                        <div className="h-px bg-surface-100 mx-3" />

                        <Link href="/profile/brand" className="flex items-center p-3.5 hover:bg-surface-50 rounded-xl transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                            <div className="w-9 h-9 bg-surface-100 text-surface-700 rounded-lg flex items-center justify-center mr-3.5 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <Settings size={18} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-surface-900 text-sm">Brand Identity</h4>
                                <p className="text-xs text-surface-500 mt-0.5 truncate">{brandSnippet}</p>
                            </div>
                            <ChevronRight size={16} className="text-surface-300" aria-hidden="true" />
                        </Link>

                        <div className="h-px bg-surface-100 mx-3" />

                        <Link href="/profile/settings" className="flex items-center p-3.5 hover:bg-surface-50 rounded-xl transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                            <div className="w-9 h-9 bg-surface-100 text-surface-700 rounded-lg flex items-center justify-center mr-3.5 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <User size={18} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-surface-900 text-sm">Account Settings</h4>
                                <p className="text-xs text-surface-500 mt-0.5 truncate">{accountSnippet}</p>
                            </div>
                            <ChevronRight size={16} className="text-surface-300" aria-hidden="true" />
                        </Link>

                        <div className="h-px bg-surface-100 mx-3" />

                        {/* Help & Support Button */}
                        <button
                            onClick={() => setIsSupportOpen(true)}
                            className="flex items-center p-3.5 hover:bg-surface-50 rounded-xl transition-colors group text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                            <div className="w-9 h-9 bg-surface-100 text-surface-700 rounded-lg flex items-center justify-center mr-3.5 shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                <HelpCircle size={18} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-surface-900 text-sm">Help &amp; Support</h4>
                                <p className="text-xs text-surface-500 mt-0.5 truncate">WhatsApp Support Active 🇳🇬</p>
                            </div>
                            <ChevronRight size={16} className="text-surface-300" aria-hidden="true" />
                        </button>

                        <div className="h-px bg-surface-100 mx-3" />

                        <Link href="/profile/privacy" className="flex items-center p-3.5 hover:bg-surface-50 rounded-xl transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                            <div className="w-9 h-9 bg-surface-100 text-surface-700 rounded-lg flex items-center justify-center mr-3.5 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <ShieldCheck size={18} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-surface-900 text-sm">Data &amp; Privacy</h4>
                                <p className="text-xs text-surface-500 mt-0.5 truncate">Manage data and privacy policies</p>
                            </div>
                            <ChevronRight size={16} className="text-surface-300" aria-hidden="true" />
                        </Link>

                        <div className="h-px bg-surface-100 mx-3" />

                        {/* Sign Out — Quiet, subtle hover row */}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center p-3.5 hover:bg-red-50/60 rounded-xl transition-colors text-surface-600 hover:text-red-600 group text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                            <div className="w-9 h-9 bg-surface-100 text-surface-500 group-hover:bg-red-100 group-hover:text-red-600 rounded-lg flex items-center justify-center mr-3.5 shrink-0 transition-colors">
                                <LogOut size={18} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm transition-colors">Sign Out</h4>
                                <p className="text-xs text-surface-400 mt-0.5 truncate">Log out of your account</p>
                            </div>
                            <ChevronRight size={16} className="text-surface-300 group-hover:text-red-400 transition-colors" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Quiet Footer */}
                <footer className="mt-4 text-center">
                    <a
                        href="https://mudiaga-dev.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-surface-400 hover:text-surface-600 transition-colors inline-block py-1 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                    >
                        Built by Mudi
                    </a>
                </footer>
            </motion.div>

            {/* Help & Support Modal */}
            <Modal
                isOpen={isSupportOpen}
                onClose={() => setIsSupportOpen(false)}
                title="Help & Support"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-xs text-surface-500 leading-relaxed">
                        Need help with your receipts or account? Find answers below or chat directly on WhatsApp.
                    </p>

                    <div className="flex flex-col gap-2.5">
                        <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/60">
                            <h4 className="text-xs font-semibold text-surface-900">How do I remove the watermark?</h4>
                            <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
                                Upgrade to Proofa Pro to export clean, watermark-free receipts and invoices.
                            </p>
                        </div>

                        <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/60">
                            <h4 className="text-xs font-semibold text-surface-900">How do I add bank details?</h4>
                            <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
                                Enable &quot;Bank Details&quot; inside any document editor or save defaults in your Bank Vault.
                            </p>
                        </div>

                        <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/60">
                            <h4 className="text-xs font-semibold text-surface-900">Can I share directly to WhatsApp?</h4>
                            <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
                                Yes! Generate any document and tap &quot;Share to WhatsApp&quot; to send a crisp image instantly.
                            </p>
                        </div>
                    </div>

                    <a
                        href="https://wa.me/2348000000000?text=Hi%20Proofa%20Support%2C%20I%20need%20help%20with%20my%20account"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                        <MessageCircle size={17} aria-hidden="true" />
                        Chat on WhatsApp
                    </a>
                </div>
            </Modal>
        </main>
    );
}
