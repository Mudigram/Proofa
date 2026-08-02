"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, PlusSquare } from "lucide-react";
import Image from "next/image";
import { triggerHaptic } from "@/lib/haptics";

export default function InstallPwaBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [showIosGuide, setShowIosGuide] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // Check dismissal timestamp (don't show again for 7 days if dismissed)
        const dismissedAt = localStorage.getItem("proofa_pwa_dismissed");
        if (dismissedAt) {
            const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return;
        }

        // Detect iOS
        const ua = window.navigator.userAgent;
        const isIosDevice = /iphone|ipad|ipod/i.test(ua);
        setIsIos(isIosDevice);

        if (isIosDevice) {
            // Show banner after 3 seconds on iOS
            const timer = setTimeout(() => setShowBanner(true), 3000);
            return () => clearTimeout(timer);
        }

        // Android / Chrome beforeinstallprompt handler
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        triggerHaptic("medium");
        if (isIos) {
            setShowIosGuide(true);
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            triggerHaptic("success");
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        triggerHaptic("light");
        setShowBanner(false);
        localStorage.setItem("proofa_pwa_dismissed", Date.now().toString());
    };

    if (!showBanner) return null;

    return (
        <>
            <AnimatePresence>
                {showBanner && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
                    >
                        <div className="bg-surface-900 text-white rounded-2xl p-4 shadow-2xl border border-surface-700/80 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shrink-0 p-1.5 shadow-md">
                                    <Image
                                        src="/Logo/Proofa orange icon.png"
                                        alt="Proofa Logo"
                                        width={28}
                                        height={28}
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold truncate">Install Proofa App</h4>
                                    <p className="text-[11px] text-surface-300 truncate">1-tap receipt access &amp; offline mode</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={handleInstallClick}
                                    className="bg-primary-500 hover:bg-primary-600 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                                >
                                    <Download size={14} aria-hidden="true" />
                                    <span>{isIos ? "Install" : "Install"}</span>
                                </button>

                                <button
                                    onClick={handleDismiss}
                                    className="p-1.5 text-surface-400 hover:text-white transition-colors rounded-lg"
                                    aria-label="Dismiss banner"
                                >
                                    <X size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS Installation Instructions Modal */}
            <AnimatePresence>
                {showIosGuide && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowIosGuide(false)}
                            className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-xs bg-white rounded-3xl p-6 relative z-10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-surface-900">Install on iPhone / iPad</h3>
                                <button
                                    onClick={() => setShowIosGuide(false)}
                                    className="p-1 text-surface-400 hover:text-surface-700"
                                >
                                    <X size={18} aria-hidden="true" />
                                </button>
                            </div>

                            <ol className="flex flex-col gap-3 text-xs text-surface-600 mb-5">
                                <li className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 font-bold flex items-center justify-center shrink-0">1</span>
                                    <span>Tap the <strong className="text-surface-900 font-semibold inline-flex items-center gap-1">Share button <Share size={13} /></strong> in Safari.</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 font-bold flex items-center justify-center shrink-0">2</span>
                                    <span>Scroll down and select <strong className="text-surface-900 font-semibold inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={13} /></strong>.</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 font-bold flex items-center justify-center shrink-0">3</span>
                                    <span>Tap <strong className="text-surface-900 font-semibold">Add</strong> to complete installation.</span>
                                </li>
                            </ol>

                            <button
                                onClick={() => {
                                    setShowIosGuide(false);
                                    setShowBanner(false);
                                }}
                                className="w-full bg-surface-900 text-white font-bold py-3 rounded-xl text-xs active:scale-95 transition-all"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
