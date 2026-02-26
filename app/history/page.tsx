"use client";

import React, { useState, useEffect } from "react";
import { getHistory, deleteDocument } from "@/lib/StorageUtils";
import { SavedDocument, ReceiptData, InvoiceData, OrderData } from "@/lib/types";
import { formatCurrency, formatDate } from "@/components/templates/TemplateUtils";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import Link from "next/link";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function HistoryPage() {
    const [history, setHistory] = useState<SavedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<SavedDocument | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        setHistory(getHistory());
        setIsLoading(false);
    }, []);

    const openDeleteModal = (doc: SavedDocument, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedDoc(doc);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedDoc) {
            deleteDocument(selectedDoc.id);
            setHistory(getHistory());
            setIsDeleteModalOpen(false);
            showToast("Document deleted successfully", "success");
            setSelectedDoc(null);
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
                                            {/* Type Indicator with Letter */}
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${doc.type === "receipt" ? "bg-orange-50 text-orange-600" :
                                                doc.type === "invoice" ? "bg-blue-50 text-blue-600" :
                                                    "bg-purple-50 text-purple-600"
                                                }`}>
                                                {doc.type === "receipt" ? "R" : doc.type === "invoice" ? "I" : "S"}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-surface-300">
                                                        {doc.type === 'order' ? 'summary' : doc.type}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-surface-200" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-surface-300">{formatDate(doc.createdAt)}</span>
                                                </div>
                                                <h3 className="text-sm font-black text-surface-900 truncate">
                                                    {getDocTitle(doc)}
                                                </h3>
                                            </div>

                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <p className="text-sm font-black text-surface-900">
                                                    {formatCurrency(getDocAmount(doc))}
                                                </p>
                                                <button
                                                    onClick={(e) => openDeleteModal(doc, e)}
                                                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all relative z-20"
                                                    title="Delete Document"
                                                >
                                                    <Trash2 size={14} />
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

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Delete Document?"
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <p className="text-surface-500 text-sm font-medium leading-relaxed mb-8">
                            Are you sure you want to delete <strong className="text-surface-900">"{selectedDoc ? getDocTitle(selectedDoc) : ""}"</strong>? This action cannot be undone.
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
                                className="w-full bg-white text-surface-400 font-black py-5 rounded-2xl active:scale-[0.98] transition-all uppercase text-xs tracking-widest"
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
