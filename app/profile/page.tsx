"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, LogOut, ChevronRight, Crown, Settings, WalletCards, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const { user, profile, isPro, plan, signOut, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    if (isLoading) {
        return (
            <main className="app-container min-h-screen pb-24 pt-8 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin"></div>
            </main>
        );
    }

    // If not authenticated, show a prompt to sign in
    if (!isAuthenticated) {
        return (
            <main className="app-container min-h-screen pb-24 pt-8">
                <div className="h-full flex flex-col items-center justify-center pt-20 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-6 shadow-xl shadow-primary-500/10">
                        <User size={40} className="opacity-80" />
                    </div>
                    <h1 className="text-2xl font-black text-surface-900 mb-2 tracking-tight">Your Profile</h1>
                    <p className="text-surface-500 text-sm mb-8 px-8 leading-relaxed">
                        Sign in to save your receipts, manage your bank details, and upgrade your branding.
                    </p>
                    <Link
                        href="/auth/signup"
                        className="bg-primary-500 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all text-sm mb-4 block w-full max-w-xs mx-auto"
                    >
                        Create Free Account
                    </Link>
                    <Link
                        href="/auth/login"
                        className="bg-white text-surface-700 border-2 border-surface-200 font-bold py-4 px-10 rounded-2xl active:scale-95 transition-all text-sm block w-full max-w-xs mx-auto"
                    >
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="app-container min-h-screen pb-32 pt-8">
            <header className="mb-8 relative text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-surface-200/5 border border-surface-100">
                    <Image
                        src="/Logo/Proofa orange icon.png"
                        alt="Proofa Logo"
                        width={40}
                        height={40}
                        className="object-contain drop-shadow-md"
                        unoptimized
                    />
                </div>
                <h1 className="text-3xl font-black text-surface-900 tracking-tight">Account</h1>
                <p className="text-sm text-surface-500 font-medium mt-1">Manage your Proofa settings</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
            >
                {/* User Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-surface-200/5 border border-surface-100 flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                        <span className="text-2xl font-bold text-primary-600">
                            {profile?.businessName?.[0]?.toUpperCase() || profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User size={24} />}
                        </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h2 className="text-lg font-bold text-surface-900 truncate">
                            {profile?.businessName || profile?.name || "Business Owner"}
                        </h2>
                        <p className="text-sm text-surface-500 truncate">{user?.email}</p>
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-surface-100 text-surface-600 text-[9px] font-black uppercase tracking-widest rounded-md mt-2">
                            {plan === 'business' ? 'BUSINESS TIER' : isPro ? 'PRO TIER' : 'FREE TIER'}
                        </div>
                    </div>
                </div>

                {/* Plan Status Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-surface-200/5 border border-surface-100 relative overflow-hidden">
                    {/* Background blob based on plan */}
                    <div className={`absolute -right-10 -top-10 w-40 h-40 blur-3xl opacity-20 rounded-full ${plan === "business" ? "bg-purple-500" : isPro ? "bg-amber-500" : "bg-primary-500"
                        }`}></div>

                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-surface-900 flex items-center gap-1.5">
                                    Current Plan
                                    {isPro && <Crown size={14} className="text-amber-500 fill-amber-500" />}
                                </h3>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className={`text-2xl font-black capitalize tracking-tight ${plan === "business" ? "text-purple-600" : isPro ? "text-amber-600" : "text-surface-500"
                                    }`}>
                                    {plan}
                                </span>
                                {!isPro && (
                                    <span className="text-[10px] text-surface-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Upgrade to add logos, brand colors, and bank vault.
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isPro ? (
                            <Link
                                href="/pricing"
                                className="bg-surface-900 text-white text-xs font-bold px-4 py-3 text-center rounded-xl shadow-md active:scale-95 transition-all whitespace-nowrap flex-shrink-0"
                            >
                                Upgrade Plan
                            </Link>
                        ) : (
                            <Link
                                href="/pricing"
                                className="bg-white border-2 border-surface-200 text-surface-700 text-xs font-bold px-4 py-3 rounded-xl shadow-sm active:scale-95 transition-all whitespace-nowrap flex-shrink-0"
                            >
                                Manage
                            </Link>
                        )}
                    </div>
                </div>

                {/* Settings Links */}
                <div className="bg-white rounded-[2rem] p-3 shadow-xl shadow-surface-200/5 border border-surface-100">
                    <div className="flex flex-col">
                        <Link href="/profile/vault" className="flex items-center p-4 hover:bg-surface-50 rounded-2xl transition-colors group">
                            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <WalletCards size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-surface-900 text-sm">Bank Vault</h4>
                                <p className="text-xs text-surface-500 mt-0.5">Manage saved account details {!isPro && "(Pro)"}</p>
                            </div>
                            <ChevronRight size={18} className="text-surface-300" />
                        </Link>

                        <div className="h-px bg-surface-100 mx-4"></div>

                        <Link href="/profile/brand" className="flex items-center p-4 hover:bg-surface-50 rounded-2xl transition-colors group">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <Settings size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-surface-900 text-sm">Brand Identity</h4>
                                <p className="text-xs text-surface-500 mt-0.5">Colors, Logo & Currency</p>
                            </div>
                            <ChevronRight size={18} className="text-surface-300" />
                        </Link>

                        <div className="h-px bg-surface-100 mx-4"></div>

                        <Link href="/profile/settings" className="flex items-center p-4 hover:bg-surface-50 rounded-2xl transition-colors group">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-surface-900 text-sm">Account Settings</h4>
                                <p className="text-xs text-surface-500 mt-0.5">Edit profile and business name</p>
                            </div>
                            <ChevronRight size={18} className="text-surface-300" />
                        </Link>

                        <div className="flex items-center p-4 opacity-50 cursor-not-allowed">
                            <div className="w-10 h-10 bg-surface-100 text-surface-400 rounded-xl flex items-center justify-center mr-4">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-surface-600 text-sm">Data & Privacy</h4>
                                <p className="text-xs text-surface-400 mt-0.5">Export data (Coming soon)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sign Out & Footer */}
                <div className="flex flex-col gap-6 mt-4">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 p-4 text-red-500 font-bold text-sm bg-white hover:bg-red-50 rounded-[1.5rem] border border-red-100 transition-colors active:scale-[0.98] shadow-sm mx-auto w-full max-w-[200px]"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>

                    <a
                        href="https://mudiaga-dev.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white border border-surface-100 shadow-sm mx-auto overflow-hidden relative rounded-full text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] hover:bg-primary-50 transition-all transform active:scale-95 group"
                    >
                        <span className="relative z-10">Built with ❤️ by Mudi</span>
                    </a>
                </div>
            </motion.div>
        </main>
    );
}
