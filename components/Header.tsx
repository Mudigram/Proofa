"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Crown, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import CustomerCareModal from "@/components/CustomerCareModal";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { isPro } = useAuth();
    const [isCareOpen, setIsCareOpen] = useState(false);

    if (pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;

    const isHome = pathname === "/";
    const isPricing = pathname === "/pricing";

    // Map paths to human-readable titles
    const getPageTitle = () => {
        if (pathname.includes("/receipt")) return "New Receipt";
        if (pathname.includes("/invoice")) return "Invoice Generator";
        if (pathname.includes("/order")) return "Create New Summary";
        if (pathname.includes("/how-it-works")) return "How it Works";
        if (pathname.includes("/history")) return "History";
        if (pathname.includes("/templates")) return "Templates";
        if (pathname.includes("/profile/vault")) return "Bank Vault";
        if (pathname.includes("/profile/brand")) return "Brand Identity";
        if (pathname.includes("/profile/settings")) return "Account Settings";
        if (pathname.includes("/profile/privacy")) return "Data & Privacy";
        if (pathname.includes("/profile")) return "Account";
        return "";
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-lg border-b border-surface-100 dark:border-surface-800 transition-colors duration-200">
                <div className="app-container flex items-center justify-between h-16">
                    <div className="flex items-center">
                        {!isHome ? (
                            <button
                                onClick={() => router.back()}
                                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-surface-900 dark:text-surface-100 active:bg-surface-100 dark:active:bg-surface-800 transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                            </button>
                        ) : (
                            <Link href="/" className="flex items-center">
                                <div className="w-16 h-16 flex items-center justify-center">
                                    <Image
                                        src="/Logo/Proofa orange icon.png"
                                        alt="Proofa Icon"
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 object-contain"
                                        priority
                                    />
                                </div>
                            </Link>
                        )}

                        <h2 className={`font-black tracking-tight font-heading text-surface-900 dark:text-white ${!isHome ? 'text-lg' : 'text-xl'}`}>
                            {isHome ? "PROOFA" : getPageTitle().toUpperCase()}
                        </h2>
                    </div>

                    {/* Right side controls - Customer Care, Dark Mode Toggle & Go Pro */}
                    <div className="flex items-center gap-2.5">
                        {/* Customer Care Direct Help */}
                        <button
                            type="button"
                            onClick={() => setIsCareOpen(true)}
                            title="Proofa Customer Care & WhatsApp Support"
                            aria-label="Customer Care"
                            className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 active:scale-95 transition-all relative"
                        >
                            <MessageCircle size={16} strokeWidth={2.5} />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </button>

                        <ThemeToggle />

                        {!isPro && !isPricing && (
                            <Link
                                href="/pricing"
                                className="flex items-center gap-2 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/50 px-3 py-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 active:scale-95 transition-all group"
                            >
                                <Crown size={14} className="group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Go Pro</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Customer Care Modal Accessible Globally */}
            <CustomerCareModal isOpen={isCareOpen} onClose={() => setIsCareOpen(false)} />
        </>
    );
}
