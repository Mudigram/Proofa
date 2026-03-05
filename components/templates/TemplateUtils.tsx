"use client";

import React from "react";
import { DocumentType } from "@/lib/types";

export interface TemplateProps {
    data: any;
    type: DocumentType;
    isPro?: boolean;
    currencyCode?: string;
}

export const formatCurrency = (val: number, currencyCode: string = "NGN") => {
    // Standardize currency locale and symbols
    const locales: Record<string, string> = {
        "NGN": "en-NG",
        "USD": "en-US",
        "GBP": "en-GB",
        "EUR": "en-IE"
    };

    const locale = locales[currencyCode] || "en-NG";

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
    }).format(val).replace("NGN", "₦");
};

export const formatDollar = (val: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(val);
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

export const Watermark = ({ isPro }: { isPro?: boolean }) => {
    if (isPro) return null;
    return (
        <div className="absolute inset-1 pointer-events-none select-none overflow-hidden z-[1] opacity-[0.08]">
            <div className="absolute inset-[-50%] flex flex-col items-center justify-center gap-16 rotate-[-25deg]">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex gap-16 whitespace-nowrap">
                        {[...Array(6)].map((_, j) => (
                            <span key={j} className="text-4xl font-black uppercase tracking-[0.3em] text-surface-700">
                                PROOFA
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Branding = ({ isPro }: { isPro?: boolean }) => {
    if (isPro) return null;
    return (
        <div className="mt-2 pt-2 border-t border-surface-100 flex items-center justify-center gap-2 opacity-80 grayscale">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Created with Proofa</span>
        </div>
    );
};
