"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SpeedDialProps {
    isOpen: boolean;
    onClose: () => void;
}

const actions = [
    {
        label: "Receipt",
        subtitle: "Payment proof",
        href: "/receipt",
        bgClass: "bg-primary-500 text-white shadow-lg shadow-primary-500/30",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                <path d="M16 14h-8" />
                <path d="M16 10h-8" />
            </svg>
        ),
    },
    {
        label: "Invoice",
        subtitle: "Itemized bill",
        href: "/invoice",
        bgClass: "bg-secondary-900 text-white shadow-lg shadow-secondary-900/30",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
            </svg>
        ),
    },
    {
        label: "Order",
        subtitle: "Summary",
        href: "/order",
        bgClass: "bg-white text-surface-900 border border-surface-200 shadow-lg shadow-surface-900/10",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
    },
];

export default function SpeedDial({ isOpen, onClose }: SpeedDialProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
                    />

                    {/* Speed Dial Items — fan out above the FAB */}
                    <div className="fixed bottom-[5.5rem] left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse items-center gap-3">
                        {actions.map((action, index) => (
                            <motion.div
                                key={action.href}
                                initial={{ opacity: 0, scale: 0.3, y: 40 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: {
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 22,
                                        delay: index * 0.06,
                                    },
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.3,
                                    y: 20,
                                    transition: {
                                        duration: 0.15,
                                        delay: (actions.length - 1 - index) * 0.04,
                                    },
                                }}
                            >
                                <Link
                                    href={action.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 pl-3 pr-5 py-2.5 rounded-full ${action.bgClass} transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                                        {action.icon}
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-bold block leading-tight">{action.label}</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 leading-tight">{action.subtitle}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
