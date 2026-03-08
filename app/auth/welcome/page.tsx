"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Crown, CheckCircle2, ArrowRight, Zap, Image as ImageIcon, Smartphone } from "lucide-react";

export default function WelcomePage() {
    const features = [
        {
            icon: <Zap className="text-orange-500" size={20} />,
            title: "Remove Watermark",
            desc: "Export clean, professional documents without the 'Made with Proofa' tag."
        },
        {
            icon: <ImageIcon className="text-blue-500" size={20} />,
            title: "Permanent Business Logo",
            desc: "Upload once, and we'll auto-fetch your logo for every new receipt."
        },
        {
            icon: <Smartphone className="text-green-500" size={20} />,
            title: "HD Proofs",
            desc: "Higher resolution exports that look sharp on any screen or printer."
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            <div className="app-container py-12 flex flex-col items-center text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-primary-50 text-primary-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-primary-500/10"
                >
                    <CheckCircle2 size={40} strokeWidth={2.5} />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black text-surface-900 tracking-tight mb-4"
                >
                    Account Created!
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-surface-500 font-medium max-w-[280px] mb-12 leading-relaxed"
                >
                    Welcome to Proofa. Your professional business presence starts right here.
                </motion.p>

                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-sm bg-surface-50 rounded-[2.5rem] p-8 border border-surface-100 mb-10 text-left"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Crown className="text-primary-500" size={18} />
                        <h2 className="text-xs font-black uppercase tracking-widest text-surface-400">Unlock your upgrade</h2>
                    </div>

                    <div className="flex flex-col gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-surface-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-surface-900 mb-1">{f.title}</h3>
                                    <p className="text-[11px] font-medium text-surface-500 leading-relaxed uppercase tracking-wide">
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col gap-4 w-full max-w-xs"
                >
                    <Link
                        href="/pricing"
                        className="bg-primary-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                    >
                        See Pro Plans <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/"
                        className="text-surface-400 font-black py-4 text-xs uppercase tracking-[0.2em] active:opacity-60 transition-all"
                    >
                        Skip for now
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
