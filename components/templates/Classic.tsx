"use client";

import React from "react";
import Image from "next/image";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
    TemplateProps,
    formatCurrency,
    formatDate,
    Watermark,
    Branding
} from "./TemplateUtils";
import { ReceiptData, InvoiceData, OrderData } from "@/lib/types";

export default function ClassicTemplate({ data, type, isPro, currencyCode }: TemplateProps) {
    const isReceipt = type === "receipt";
    const isInvoice = type === "invoice";
    const isOrder = type === "order";

    const receipt = data as ReceiptData;
    const invoice = data as InvoiceData;
    const order = data as OrderData;

    const items = isReceipt ? (receipt.items || []) : (isInvoice ? invoice.items : order.items);
    const subtotal = (isReceipt && (!receipt.items || receipt.items.length === 0))
        ? (receipt as any).amount
        : items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const vatRate = isInvoice ? (invoice.vatRate ?? 7.5) : 0;
    const includeVat = isInvoice ? (invoice.includeVat ?? true) : false;
    const tax = includeVat ? subtotal * (vatRate / 100) : 0;
    const deliveryCost = data.deliveryInfo?.enabled ? (data.deliveryInfo.cost ?? 0) : 0;
    const total = (isReceipt ? subtotal : (isOrder ? order.totalAmount : subtotal + tax)) + deliveryCost;

    return (
        <div className="relative bg-white min-h-[600px] flex flex-col font-mono text-zinc-800 mx-auto max-w-[480px] shadow-2xl p-8" id="document-preview">
            {/* 1. MINIMAL LETTERHEAD */}
            <div className={`flex flex-col items-center border-b-2 pb-4 mb-4`} style={{ borderBottomColor: "var(--color-primary-500, #000)" }}>
                {data.logoUrl ? (
                    <BrandLogo
                        src={data.logoUrl}
                        businessName={isInvoice ? invoice.businessName : (isReceipt ? receipt.businessName : "Store")}
                        size={64}
                        className="mb-2 grayscale shadow-none"
                    />
                ) : (
                    <div className="w-16 h-16 mb-2 border-2 border-zinc-900 rounded-full flex items-center justify-center font-black text-xl italic grayscale shadow-none">
                        {(isInvoice ? invoice.businessName : (isReceipt ? receipt.businessName : "S")).charAt(0)}
                    </div>
                )}
                <h1 className="text-xl font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-primary-500, #000)" }}>
                    {isInvoice ? invoice.businessName : (isReceipt ? receipt.businessName : "Store")}
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-zinc-500 mt-1 max-w-[300px] text-center">
                    {isInvoice ? invoice.businessAddress : "Lagos, Nigeria"}
                </p>
            </div>

            {/* 2. DOCUMENT META */}
            <div className="flex justify-between items-end mb-6 text-[10px] uppercase font-bold tracking-tight">
                <div>
                    <p className="text-zinc-400">Issued To:</p>
                    <p className="text-sm font-black">{isReceipt ? receipt.customerName || "Customer" : (isInvoice ? invoice.clientName : order.customerName)}</p>
                    {data.deliveryInfo?.enabled && (
                        <p className="text-[9px] font-normal text-zinc-500 mt-1 italic leading-tight max-w-[150px]">
                            {data.deliveryInfo.address}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p><span className="text-zinc-400">Ref:</span> {isInvoice ? invoice.invoiceNumber : "TXN-001"}</p>
                    <p><span className="text-zinc-400">Date:</span> {formatDate(isReceipt ? receipt.date : (isInvoice ? invoice.issueDate : new Date().toISOString()))}</p>
                </div>
            </div>

            {/* 3. TABLE HEADER */}
            <div className="grid grid-cols-12 border-y py-2 text-[9px] font-black uppercase tracking-widest mb-4" style={{ borderTopColor: "var(--color-primary-500, #000)", borderBottomColor: "var(--color-primary-500, #000)" }}>
                <div className="col-span-1">#</div>
                <div className="col-span-7">Description</div>
                <div className="col-span-4 text-right">Amount</div>
            </div>

            {/* 4. ITEMS LIST */}
            <div className="flex-1 space-y-4">
                {isReceipt && (!receipt.items || receipt.items.length === 0) ? (
                    <div className="grid grid-cols-12 text-xs">
                        <div className="col-span-1">01</div>
                        <div className="col-span-7 font-bold uppercase">{(receipt as any).description || "General Purchase"}</div>
                        <div className="col-span-4 text-right font-bold">{formatCurrency((receipt as any).amount, currencyCode)}</div>
                    </div>
                ) : (
                    Object.entries(
                        items.reduce((acc, item) => {
                            const cat = item.category || "General";
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(item);
                            return acc;
                        }, {} as Record<string, typeof items>)
                    ).map(([category, catItems]) => (
                        <div key={category} className="space-y-3">
                            {Object.keys(items.reduce((acc, i) => { acc[i.category || "General"] = true; return acc; }, {} as any)).length > 1 && (
                                <p className="text-[8px] font-black uppercase text-zinc-400 border-b border-zinc-100 pb-1">{category}</p>
                            )}
                            {catItems.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 text-xs items-baseline">
                                    <div className="col-span-1 text-zinc-400">{items.indexOf(item) + 1}</div>
                                    <div className="col-span-7 flex flex-col">
                                        <span className="font-bold uppercase leading-none">{item.name}</span>
                                        <span className="text-[9px] text-zinc-500 mt-1">{item.quantity} x {formatCurrency(item.price, currencyCode)}</span>
                                    </div>
                                    <div className="col-span-4 text-right font-bold">{formatCurrency(item.quantity * item.price, currencyCode)}</div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* 5. SUMMARY LEDGER */}
            <div className="border-t border-zinc-200 pt-4 flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] uppercase">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, currencyCode)}</span>
                </div>
                {isInvoice && includeVat && (
                    <div className="flex justify-between text-[10px] uppercase">
                        <span>VAT ({vatRate}%)</span>
                        <span>{formatCurrency(tax, currencyCode)}</span>
                    </div>
                )}
                {data.deliveryInfo?.enabled && (
                    <div className="flex justify-between text-[10px] uppercase">
                        <span>Delivery</span>
                        <span>{formatCurrency(deliveryCost)}</span>
                    </div>
                )}
                <div className="flex justify-between border-t-2 mt-2 pt-2" style={{ borderTopColor: "var(--color-primary-500, #000)" }}>
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Total Due</span>
                    <span className="text-xl font-black" style={{ color: "var(--brand-accent, #2563eb)" }}>{formatCurrency(total, currencyCode)}</span>
                </div>
            </div>

            {/* 6. BANK INFO (Clean & Integrated) */}
            {data.bankDetails?.enabled && (
                <div className="mt-6 pt-4 border-t border-dotted border-zinc-300">
                    <p className="text-[8px] font-bold uppercase text-zinc-400 mb-2">Payment Information</p>
                    <div className="flex justify-between text-[10px] font-bold" style={{ color: "var(--brand-accent, #2563eb)" }}>
                        <span>{data.bankDetails.bankName} / {data.bankDetails.accountName}</span>
                        <span className="tracking-widest">{data.bankDetails.accountNumber}</span>
                    </div>
                </div>
            )}

            {/* 7. FOOTER */}
            <div className="mt-auto pt-2 flex justify-between items-center text-[8px] uppercase tracking-tighter text-zinc-400">
                <p>{data.terms || "Goods sold are not returnable."}</p>
                <Branding isPro={isPro} />
            </div>

            <Watermark isPro={isPro} />
        </div>
    );
}