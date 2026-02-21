"use client";

import React, { useState, useEffect } from "react";
import { getHistory, deleteDocument } from "@/lib/StorageUtils";
import { SavedDocument, ReceiptData, InvoiceData, OrderData } from "@/lib/types";
import { formatCurrency, formatDate } from "@/components/templates/TemplateUtils";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import Link from "next/link";

export default function HistoryPage() {
    const [history, setHistory] = useState<SavedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setHistory(getHistory());
        setIsLoading(false);
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this document?")) {
            deleteDocument(id);
            setHistory(getHistory());
        }
    };

    const getDocTitle = (doc: SavedDocument) => {
        const data = doc.data as any;
        return data.businessName || data.customerName || "Untitled Document";
    };

    const getDocAmount = (doc: SavedDocument) => {
        const data = doc.data as any;
        if (doc.type === "receipt") return data.amount;
        if (doc.type === "order") return data.totalAmount;
        if (doc.type === "invoice") {
            const subtotal = data.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
            return subtotal * 1.075; // Including tax for display
        }
        return 0;
    };

    if (isLoading) {
        return <main className="app-container py-6">Loading history...</main>;
    }

    return (
        <PageTransition>
            <main className="app-container py-6 pb-24">
                <header className="mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-surface-900">Document History</h1>
                    <p className="text-sm text-surface-400 font-medium mt-1">
                        Your {history.length} most recent documents.
                    </p>
                </header>

                {history.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-surface-200 rounded-[2.5rem] p-12 text-center">
                        <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-300">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-surface-900 mb-1">No Documents Yet</h3>
                        <p className="text-sm text-surface-400 font-medium max-w-[200px] mx-auto">
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
                    <StaggerContainer>
                        <div className="grid gap-4">
                            {history.map((doc) => (
                                <StaggerItem key={doc.id}>
                                    <div className="group relative bg-white border border-surface-200 rounded-[2rem] p-5 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                                        <div className="flex items-center gap-4">
                                            {/* Type Icon */}
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${doc.type === "receipt" ? "bg-orange-50 text-orange-500" :
                                                doc.type === "invoice" ? "bg-blue-50 text-blue-500" :
                                                    "bg-purple-50 text-purple-500"
                                                }`}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-surface-300">{doc.type}</span>
                                                    <span className="w-1 h-1 rounded-full bg-surface-200" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-surface-300">{formatDate(doc.createdAt)}</span>
                                                </div>
                                                <h3 className="text-sm font-black text-surface-900 truncate">
                                                    {getDocTitle(doc)}
                                                </h3>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-black text-surface-900">
                                                    {formatCurrency(getDocAmount(doc))}
                                                </p>
                                                <button
                                                    onClick={(e) => handleDelete(doc.id, e)}
                                                    className="text-[10px] font-bold text-red-400 hover:text-red-500 mt-1 uppercase tracking-wider"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Link Mask */}
                                        <Link href={`/${doc.type}?id=${doc.id}`} className="absolute inset-0 rounded-[2rem]" />
                                    </div>
                                </StaggerItem>
                            ))}
                        </div>
                    </StaggerContainer>
                )}
            </main>
        </PageTransition>
    );
}
