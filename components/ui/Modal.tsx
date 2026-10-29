"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "max-w-sm",
}: ModalProps) => {
    // Prevent scrolling behind modal when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-surface-950/70 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        className={`w-full ${maxWidth} max-h-[calc(100dvh-3.5rem)] sm:max-h-[88dvh] bg-white dark:bg-surface-900 rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-surface-100/80 dark:border-surface-800/80`}
                    >
                        {/* Pinned Header */}
                        <div className="px-7 pt-7 pb-3.5 flex items-center justify-between shrink-0 border-b border-surface-100/80 dark:border-surface-800/80">
                            <h2 className="text-lg sm:text-xl font-black text-surface-900 dark:text-surface-50 tracking-tight uppercase">
                                {title}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-surface-50 dark:bg-surface-800 flex items-center justify-center text-surface-400 dark:text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 transition-colors active:scale-95"
                                aria-label="Close dialog"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable Body with bottom breathing room */}
                        <div className="p-7 pt-5 overflow-y-auto no-scrollbar flex-1 overscroll-contain">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
