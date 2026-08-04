"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, WalletCards, Building2, User, Hash, Loader2, Lock, AlertTriangle, Pencil } from "lucide-react";
import { SavedBankAccount } from "@/lib/types";
import { getBankAccounts, addBankAccount, deleteBankAccount, updateBankAccount } from "@/lib/bank";
import { Modal } from "@/components/ui/Modal";

export default function BankVaultPage() {
    const { user, isPro, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [accounts, setAccounts] = useState<SavedBankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteTargetAccount, setDeleteTargetAccount] = useState<SavedBankAccount | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    useEffect(() => {
        if (!authLoading && isAuthenticated && isPro && user) {
            loadAccounts();
        } else if (!authLoading && !isAuthenticated) {
            router.push("/auth/login?from=/profile/vault");
        } else if (!authLoading) {
            setIsLoading(false); // Done loading auth, just not pro
        }
    }, [authLoading, isAuthenticated, isPro, user, router]);

    const loadAccounts = async () => {
        if (!user) return;
        setIsLoading(true);
        const { data, error } = await getBankAccounts(user.id);
        if (error) {
            setError(error.message);
        } else if (data) {
            setAccounts(data);
            localStorage.setItem("proofa_bank_vault", JSON.stringify(data));
        }
        setIsLoading(false);
    };

    const startEditing = (account: SavedBankAccount) => {
        setEditingId(account.id);
        setBankName(account.bankName);
        setAccountName(account.accountName);
        setAccountNumber(account.accountNumber);
        setIsAdding(true);
    };

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError(null);
        setIsSubmitting(true);

        const payload = {
            bankName: bankName.trim(),
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim(),
        };

        const { error } = editingId
            ? await updateBankAccount(editingId, user.id, payload)
            : await addBankAccount(user.id, payload);

        if (error) {
            setError(error.message);
            setIsSubmitting(false);
            return;
        }

        // Reset form and reload
        setEditingId(null);
        setBankName("");
        setAccountName("");
        setAccountNumber("");
        setIsAdding(false);
        await loadAccounts();
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        setIsDeleting(id);
        const { error } = await deleteBankAccount(id, user.id);
        if (error) {
            setError(error.message);
        } else {
            const updated = accounts.filter((a) => a.id !== id);
            setAccounts(updated);
            localStorage.setItem("proofa_bank_vault", JSON.stringify(updated));
        }
        setIsDeleting(null);
    };

    if (authLoading) {
        return (
            <main className="app-container min-h-screen pb-24 pt-8 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 animate-spin"></div>
            </main>
        );
    }

    // Up-sell for non-pro users
    if (!isPro) {
        return (
            <main className="app-container min-h-screen pb-24 pt-4 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mb-6 shadow-xl shadow-amber-500/10 rotate-3">
                        <Lock size={40} className="opacity-80 drop-shadow-sm" />
                    </div>
                    <h2 className="text-3xl font-black text-surface-900 dark:text-surface-50 mb-3 tracking-tight">Pro Feature</h2>
                    <p className="text-surface-500 dark:text-surface-400 text-sm font-medium mb-8 max-w-[260px] leading-relaxed">
                        Save up to 3 bank accounts and insert them into any receipt with one tap.
                    </p>
                    <Link
                        href="/pricing"
                        className="bg-surface-900 dark:bg-surface-800 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-surface-900/20 active:scale-95 transition-all text-sm w-full max-w-xs"
                    >
                        Unlock Bank Vault
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="app-container min-h-screen pb-24 pt-4">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-surface-900 dark:text-surface-50">Saved Bank Accounts</h2>
                    <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Insert saved details into any receipt</p>
                </div>
                {!isAdding && accounts.length < 3 && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-primary-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                        <Plus size={16} /> Add Bank
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-bold px-4 py-3 rounded-xl mb-6 flex justify-between items-center">
                    {error}
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-surface-900 border-2 border-surface-100 dark:border-surface-800 rounded-[1.5rem] p-5 shadow-sm flex items-center justify-between">
                            <div className="flex-1">
                                <div className="h-5 w-32 bg-surface-200 dark:bg-surface-700 animate-pulse rounded mb-2" />
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-24 bg-surface-100 dark:bg-surface-800 animate-pulse rounded" />
                                    <div className="w-1 h-1 bg-surface-200 dark:bg-surface-700 rounded-full" />
                                    <div className="h-3 w-32 bg-surface-50 dark:bg-surface-900 animate-pulse rounded" />
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 animate-pulse shrink-0" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* Add Account Form */}
                    <AnimatePresence>
                        {isAdding && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="overflow-hidden"
                            >
                                <form onSubmit={handleAddAccount} className="bg-white dark:bg-surface-900 border-2 border-primary-100 dark:border-primary-800 rounded-[2rem] p-6 shadow-xl shadow-primary-500/5 mb-2">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="font-black text-surface-900 dark:text-surface-50">New Account</h3>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-md">
                                            {accounts.length}/3 Used
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-1.5 block">Bank Name</label>
                                            <div className="relative">
                                                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                    placeholder="e.g. Zenith Bank"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-surface-50 dark:bg-surface-900 border-2 border-surface-100 dark:border-surface-800 rounded-xl text-black dark:text-surface-50 font-bold placeholder:text-surface-300 dark:placeholder:text-surface-600 focus:border-primary-500 focus:bg-white dark:focus:bg-surface-900 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-1.5 block">Account Name</label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={accountName}
                                                    onChange={(e) => setAccountName(e.target.value)}
                                                    placeholder="e.g. Amaka's Boutique"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-surface-50 dark:bg-surface-900 border-2 border-surface-100 dark:border-surface-800 rounded-xl text-black dark:text-surface-50 font-bold placeholder:text-surface-300 dark:placeholder:text-surface-600 focus:border-primary-500 focus:bg-white dark:focus:bg-surface-900 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-1.5 block">Account Number</label>
                                            <div className="relative">
                                                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={10}
                                                    required
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                                                    placeholder="e.g. 1012345678"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-surface-50 border-2 border-surface-100 rounded-xl text-black font-bold placeholder:text-surface-300 focus:border-primary-500 focus:bg-white transition-colors font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsAdding(false)}
                                            className="flex-1 py-3.5 bg-surface-100 text-surface-600 font-bold rounded-xl active:scale-95 transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 py-3.5 bg-primary-500 text-white font-bold rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save Details"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Account List */}
                    {accounts.length === 0 && !isAdding ? (
                        <div className="bg-surface-50 border-2 border-dashed border-surface-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-surface-300 mb-4 shadow-sm">
                                <WalletCards size={28} />
                            </div>
                            <h3 className="font-black text-surface-900 mb-2">No Bank Accounts</h3>
                            <p className="text-surface-500 text-xs font-medium max-w-[200px] mb-6">
                                Add your settlement accounts here to easily insert them into receipts.
                            </p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="bg-surface-900 text-white font-bold py-3.5 px-8 rounded-xl shadow-md active:scale-95 transition-all text-sm flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Account
                            </button>
                        </div>
                    ) : (
                        accounts.map((account) => (
                            <motion.div
                                key={account.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border-2 border-surface-100 rounded-[1.5rem] p-5 shadow-sm flex items-center justify-between group overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
                                <div className="pl-3 flex-1 overflow-hidden">
                                    <h4 className="font-extrabold text-black text-[15px] truncate">{account.bankName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-surface-500 text-sm font-bold tracking-wide">{account.accountNumber}</p>
                                        <span className="w-1 h-1 bg-surface-300 rounded-full"></span>
                                        <p className="text-surface-500 text-xs font-semibold truncate uppercase">{account.accountName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                    <button
                                        onClick={() => startEditing(account)}
                                        className="w-10 h-10 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-full flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 active:scale-90 transition-all"
                                        title="Edit Account"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTargetAccount(account)}
                                        disabled={isDeleting === account.id}
                                        className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 active:scale-90 transition-all disabled:opacity-50"
                                        title="Delete Account"
                                    >
                                        {isDeleting === account.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            <Modal
                isOpen={!!deleteTargetAccount}
                onClose={() => setDeleteTargetAccount(null)}
                title="Remove Bank Account?"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl">
                        <AlertTriangle size={24} className="shrink-0" />
                        <p className="text-xs font-semibold">
                            Are you sure you want to remove <strong className="font-bold">{deleteTargetAccount?.bankName} ({deleteTargetAccount?.accountNumber})</strong>? This action cannot be undone.
                        </p>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={() => setDeleteTargetAccount(null)}
                            className="flex-1 py-3 bg-surface-100 text-surface-700 font-bold rounded-xl active:scale-95 transition-all text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                if (deleteTargetAccount) {
                                    const targetId = deleteTargetAccount.id;
                                    setDeleteTargetAccount(null);
                                    await handleDelete(targetId);
                                }
                            }}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md shadow-red-600/20 active:scale-95 transition-all text-xs"
                        >
                            Yes, Remove
                        </button>
                    </div>
                </div>
            </Modal>
        </main>
    );
}
