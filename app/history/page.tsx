"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { getHistory, deleteDocument, extractAmount } from "@/lib/StorageUtils";

import { SavedDocument, ReceiptData, InvoiceData, OrderData } from "@/lib/types";
import { formatCurrency, formatDate } from "@/components/templates/TemplateUtils";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import Link from "next/link";
import { Trash2, AlertTriangle, Copy } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { fetchCloudHistory, deleteCloudDocument } from "@/lib/dashboard";
import { Crown, Zap } from "lucide-react";

export default function HistoryPage() {
    const [history, setHistory] = useState<SavedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<SavedDocument | null>(null);
    const [filter, setFilter] = useState<"all" | "saved" | "drafts">("all");
    const { showToast } = useToast();
    const { user, profile, isPro } = useAuth();

    const loadHistory = useCallback(async () => {
        const localDocs = getHistory();
        if (!user?.id) {
            setHistory(localDocs);
            setIsLoading(false);
            return;
        }

        try {
            const cloudDocs = await fetchCloudHistory(user.id);
            // Merge local and cloud documents, avoiding duplicates
            const map = new Map<string, SavedDocument>();
            localDocs.forEach(d => map.set(d.id, d));
            cloudDocs.forEach(d => map.set(d.id, d as SavedDocument));

            const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setHistory(merged);
        } catch (_) {
            setHistory(localDocs);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleRefresh = useCallback(() => {
        loadHistory();
    }, [loadHistory]);

    const { isPulling, pullDistance, isRefreshing } = usePullToRefresh(handleRefresh);

    const filteredHistory = history.filter(doc => {
        const data = doc.data as any;
        const status = typeof data.status === "string" ? data.status.toLowerCase() : "";
        if (filter === "all") return true;

        // If status is missing, treat as "Saved"
        if (filter === "drafts") return status === "draft";
        if (filter === "saved") return !status || status !== "draft";
        return true;
    });

    const openDeleteModal = (doc: SavedDocument, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedDoc(doc);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedDoc) {
            deleteDocument(selectedDoc.id);
            if (user && profile?.id) {
                deleteCloudDocument(selectedDoc.id, profile.id);
            }
            setHistory(getHistory());
            setIsDeleteModalOpen(false);
            showToast("Document deleted successfully", "success");
            setSelectedDoc(null);
        }
    };

    const handleExportDailySummary = () => {
        const todayStr = new Date().toISOString().split("T")[0];
        const todayDocs = history.filter((d) => {
            const dateStr = new Date(d.createdAt).toISOString().split("T")[0];
            return dateStr === todayStr;
        });

        const docsToSummarize = todayDocs.length > 0 ? todayDocs : history;
        const totalRev = docsToSummarize.reduce((acc, d) => acc + extractAmount(d.data, d.type), 0);
        const receiptCount = docsToSummarize.filter(d => d.type === "receipt").length;
        const invoiceCount = docsToSummarize.filter(d => d.type === "invoice").length;

        const dateTitle = todayDocs.length > 0 ? "Today's" : "Recent";
        const formattedRev = formatCurrency(totalRev, profile?.defaultCurrency || "NGN");
        const message = `📊 *Proofa ${dateTitle} Sales Summary*\n\n💰 Total Revenue: ${formattedRev}\n📄 Receipts: ${receiptCount}\n🧾 Invoices: ${invoiceCount}\n📦 Total Docs: ${docsToSummarize.length}\n\nGenerated via Proofa (proofa.ng)`;

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        showToast("Opened End-of-Day Sales Report for WhatsApp share!", "success");
    };

    const getDocTitle = (doc: SavedDocument) => {
        const data = doc.data as any;
        return data.businessName || data.customerName || data.clientName || "Untitled Document";
    };

    const getDocAmount = (doc: SavedDocument) => {
        if (!doc || !doc.data) return 0;
        return extractAmount(doc.data, doc.type);
    };


    if (isLoading) {
        return (
            <main className="app-container py-6 pb-24">
                <header className="mb-8">
                    <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 animate-pulse rounded-lg mb-2" />
                    <div className="h-4 w-32 bg-surface-100 dark:bg-surface-800 animate-pulse rounded-md" />
                </header>
                <div className="grid gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-[2rem] p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 animate-pulse shrink-0" />
                                <div className="flex-1">
                                    <div className="h-3 w-20 bg-surface-100 dark:bg-surface-800 animate-pulse rounded mb-2" />
                                    <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 animate-pulse rounded" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 animate-pulse rounded" />
                                    <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        );
    }

    return (
        <PageTransition>
            <main className="app-container py-6 pb-24" style={{ overscrollBehaviorY: "contain" }}>
                {/* Pull-to-refresh indicator */}
                {(isPulling || isRefreshing) && (
                    <div
                        className="flex justify-center items-center overflow-hidden transition-all duration-200"
                        style={{ height: isRefreshing ? 48 : pullDistance * 0.6 }}
                    >
                        <div className={`w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full ${isRefreshing ? "animate-spin" : ""}`}
                            style={!isRefreshing ? { transform: `rotate(${pullDistance * 3}deg)`, opacity: Math.min(pullDistance / 60, 1) } : undefined}
                        />
                    </div>
                )}

                <header className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-surface-900 dark:text-surface-50">Document History</h1>
                        <p className="text-sm text-surface-400 dark:text-surface-500 font-medium mt-1">
                            Your {history.length} most recent documents.
                        </p>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={handleExportDailySummary}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                            title="Share End-of-Day Sales Report to WhatsApp"
                        >
                            <Zap size={14} className="fill-white" /> Daily Report
                        </button>
                    )}
                </header>

                {history.length === 0 ? (
                    <div className="bg-white dark:bg-surface-900 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-[2.5rem] p-12 text-center">
                        <div className="w-16 h-16 bg-surface-50 dark:bg-surface-900 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-300">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-1">No Documents Yet</h3>
                        <p className="text-sm text-surface-400 dark:text-surface-500 font-medium max-w-[200px] mx-auto">
                            Generated documents appear here automatically.
                        </p>
                        <Link
                            href="/"
                            className="inline-block mt-6 px-6 py-3 bg-primary-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-transform active:scale-95"
                        >
                            Create Now
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Filter Tabs */}
                        <div className="flex p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-800 mb-8 mx-auto max-w-[400px]">
                            {(["all", "saved", "drafts"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? "bg-white dark:bg-surface-900 text-primary-500 shadow-sm" : "text-surface-400 dark:text-surface-500"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <StaggerContainer key={filter}>
                            {!isPro && filter !== "drafts" && (
                                <StaggerItem>
                                    <div className="mb-6 overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-amber-500 opacity-[0.08]" />
                                        <div className="relative border-2 border-primary-500/20 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 justify-between shadow-sm">
                                            <div className="flex items-center gap-4 text-center md:text-left">
                                                <div className="w-14 h-14 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
                                                    <Zap size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-surface-900 dark:text-surface-50 uppercase tracking-tight">Remove the watermark</h3>
                                                    <p className="text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest leading-relaxed max-w-[200px]">Upgrade to Pro to export clean, branded documents.</p>
                                                </div>
                                            </div>
                                            <Link
                                                href="/pricing"
                                                className="bg-surface-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-xl shadow-lg shadow-black/10 active:scale-95 transition-all whitespace-nowrap"
                                            >
                                                Unlock Pro Features
                                            </Link>
                                        </div>
                                    </div>
                                </StaggerItem>
                            )}
                            <div className="grid gap-4">
                                {filteredHistory.map((doc) => (
                                    <StaggerItem key={doc.id}>
                                        <div className="group relative bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-[2rem] p-5 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                                            <div className="flex items-center gap-4">
                                                {/* Type Indicator with Letter */}
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${doc.type === "receipt" ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400" :
                                                    doc.type === "invoice" ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" :
                                                        "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
                                                    }`}>
                                                    {doc.type === "receipt" ? "R" : doc.type === "invoice" ? "I" : "S"}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-surface-300">
                                                            {doc.type === 'order' ? 'summary' : doc.type}
                                                        </span>
                                                        {(doc.data as any).status === "Draft" && (
                                                            <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Draft</span>
                                                        )}
                                                        {!user && (
                                                            <span className="bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Saved Offline</span>
                                                        )}
                                                        <span className="w-1 h-1 rounded-full bg-surface-200 dark:bg-surface-700" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-surface-300">{formatDate(doc.createdAt)}</span>
                                                    </div>
                                                    <h3 className="text-sm font-black text-surface-900 dark:text-surface-50 truncate">
                                                        {getDocTitle(doc)}
                                                    </h3>
                                                </div>

                                                <div className="flex flex-col items-end gap-1 shrink-0 relative z-20">
                                                    <p className="text-sm font-black text-surface-900 dark:text-surface-50">
                                                        {formatCurrency(getDocAmount(doc))}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Link
                                                            href={`/${doc.type}?duplicateFrom=${doc.id}`}
                                                            className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 transition-all"
                                                            title="Duplicate as New Sale"
                                                        >
                                                            <Copy size={14} />
                                                        </Link>
                                                        <button
                                                            onClick={(e) => openDeleteModal(doc, e)}
                                                            className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                            title="Delete Document"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Link Mask */}
                                            <Link href={`/${doc.type}?id=${doc.id}`} className="absolute inset-0 rounded-[2rem]" />
                                        </div>
                                    </StaggerItem>
                                ))}
                                {filteredHistory.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-sm text-surface-400 dark:text-surface-500 font-bold uppercase tracking-widest">No {filter} found.</p>
                                    </div>
                                )}
                            </div>
                        </StaggerContainer>
                    </>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Delete Document?"
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 dark:text-red-400">
                            <AlertTriangle size={32} />
                        </div>
                        <p className="text-surface-500 dark:text-surface-400 text-sm font-medium leading-relaxed mb-8">
                            Are you sure you want to delete <strong className="text-surface-900 dark:text-surface-50">"{selectedDoc ? getDocTitle(selectedDoc) : ""}"</strong>? This action cannot be undone.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all uppercase text-xs tracking-widest"
                            >
                                Yes, Delete Forever
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="w-full bg-white dark:bg-surface-900 text-surface-400 dark:text-surface-500 font-black py-5 rounded-2xl active:scale-[0.98] transition-all uppercase text-xs tracking-widest"
                            >
                                Keep Document
                            </button>
                        </div>
                    </div>
                </Modal>
            </main>
        </PageTransition>
    );
}
