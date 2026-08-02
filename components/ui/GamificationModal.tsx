"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2 } from "lucide-react";

interface GamificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSupportUs: () => void;
    onShare: () => void;
}

export function GamificationModal({ isOpen, onClose, onSupportUs, onShare }: GamificationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-surface-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6 pb-8 flex flex-col gap-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-black text-surface-900 tracking-tight leading-tight">
                                            Remove Watermark
                                        </h2>
                                        <p className="text-surface-500 text-sm mt-1">
                                            Keep it professional. Want to export without the &quot;Made with Proofa&quot; watermark?
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-surface-500 hover:text-surface-900 transition-colors"
                                    >
                                        <X size={16} strokeWidth={3} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={onShare}
                                        className="w-full bg-primary-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-primary-500/20"
                                    >
                                        <Share2 size={18} strokeWidth={2.5} />
                                        Share Proofa to remove it!
                                    </button>

                                    <button
                                        onClick={onSupportUs}
                                        className="w-full bg-surface-50 text-surface-600 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 border border-surface-200 active:scale-95 transition-all"
                                    >
                                        Keep watermark & support us
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
