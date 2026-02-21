"use client";

import React from "react";
import { ReceiptData, InvoiceData, OrderData, DocumentType } from "@/lib/types";

export interface TemplateProps {
    data: any;
    type: DocumentType;
}

export const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
    }).format(val).replace("NGN", "₦");
};

export const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch (e) {
        return dateStr;
    }
};

export const Watermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none rotate-10">
        <span className="text-6xl font-black uppercase tracking-[0.5em]">PROOFA PROOFA PROOFA</span>
    </div>
);

export const Branding = () => (
    <div className="mt-2 pt-2 border-t border-surface-100 flex items-center justify-center gap-2 opacity-80 grayscale">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Created with Proofa</span>
    </div>
);
