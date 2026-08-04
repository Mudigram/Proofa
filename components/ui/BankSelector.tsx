"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getBankAccounts } from "@/lib/bank";
import { SavedBankAccount } from "@/lib/types";
import { Loader2, WalletCards, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BankSelectorProps {
    onSelect: (bankName: string, accountName: string, accountNumber: string) => void;
}

export function BankSelector({ onSelect }: BankSelectorProps) {
    const { user, isPro, isAuthenticated } = useAuth();
    const [accounts, setAccounts] = useState<SavedBankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            const cached = localStorage.getItem("proofa_bank_vault");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setAccounts(parsed);
                }
            }
        } catch (_) {}

        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchAccounts = async () => {
            const { data } = await getBankAccounts(user.id);
            if (data && data.length > 0) {
                setAccounts(data);
                localStorage.setItem("proofa_bank_vault", JSON.stringify(data));
            }
            setIsLoading(false);
        };

        fetchAccounts();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-surface-400 dark:text-surface-500 text-xs font-bold px-2 py-1">
                <Loader2 size={12} className="animate-spin" />
                LOADING VAULT...
            </div>
        );
    }

    if (accounts.length === 0) {
        return null;
    }

    return (
        <div className="relative mb-4 z-10">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors active:scale-95"
            >
                <WalletCards size={14} />
                Insert from Vault
                <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-full max-w-[280px] bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl rounded-2xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-800"
                    >
                        {accounts.map((acc) => (
                            <button
                                key={acc.id}
                                type="button"
                                onClick={() => {
                                    onSelect(acc.bankName, acc.accountName, acc.accountNumber);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left p-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors group flex items-start justify-between"
                            >
                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                    <span className="text-sm font-black text-surface-900 dark:text-surface-50 truncate">{acc.bankName}</span>
                                    <span className="text-xs font-bold text-surface-500 dark:text-surface-400 tracking-wider truncate">{acc.accountNumber}</span>
                                    <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest truncate">{acc.accountName}</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-300 dark:text-surface-600 flex items-center justify-center scale-0 group-hover:scale-100 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/60 group-hover:text-primary-500 transition-all">
                                    <Check size={12} />
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
