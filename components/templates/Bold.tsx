"use client";

import React from "react";
import Image from "next/image";
import {
    TemplateProps,
    formatCurrency,
    formatDate,
    Watermark,
    Branding
} from "./TemplateUtils";
import { ReceiptData, InvoiceData, OrderData } from "@/lib/types";

export default function BoldTemplate({ data, type }: TemplateProps) {
    const isReceipt = type === "receipt";
    const isInvoice = type === "invoice";
    const isOrder = type === "order";

    const receipt = data as ReceiptData;
    const invoice = data as InvoiceData;
    const order = data as OrderData;

    const logoUrl = data.logoUrl;

    const items = isReceipt ? [] : (isInvoice ? invoice.items : order.items);
    const subtotal = isReceipt ? receipt.amount : items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    // Dynamic Tax Calculation
    const vatRate = isInvoice ? (invoice.vatRate ?? 7.5) : 0;
    const includeVat = isInvoice ? (invoice.includeVat ?? true) : false;
    const tax = includeVat ? subtotal * (vatRate / 100) : 0;

    const total = isReceipt ? receipt.amount : (isOrder ? order.totalAmount : subtotal + tax);

    return (
        <div className="relative bg-white min-h-[600px] flex flex-col font-sans text-surface-900 shadow-2xl mx-auto max-w-[500px] overflow-hidden font-heading" id="document-preview">
            <Watermark />

            {/* Bold Top Stripe */}
            <div className="h-4 bg-primary-500 w-full" />

            <div className="p-10 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex flex-col mb-12">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 bg-surface-900 text-white flex items-center justify-center text-4xl font-black rounded-full shadow-lg overflow-hidden">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt="Logo"
                                    width={64}
                                    height={64}
                                    unoptimized
                                    className="w-full h-full object-contain rounded-full"
                                />
                            ) : (
                                "P"
                            )}
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-1">
                                {isReceipt ? "Receipt" : (isInvoice ? "Invoice" : "Summary")}
                            </h2>
                            <p className="text-xs font-black text-primary-500 uppercase tracking-widest">
                                {isInvoice ? `#${invoice.invoiceNumber}` : "CONFIRMED"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-b-4 border-surface-900 pb-6">
                        <div>
                            <h3 className="text-xl font-black tracking-tighter uppercase font-heading">{isInvoice ? invoice.businessName : (isReceipt ? receipt.businessName : "Proofa Store")}</h3>
                            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{isInvoice ? invoice.businessAddress : "Lagos, Nigeria"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-surface-300">Date Issued</p>
                            <p className="text-xs font-black">{formatDate(isReceipt ? receipt.date : (isInvoice ? invoice.issueDate : new Date().toISOString()))}</p>
                        </div>
                    </div>
                </div>

                {/* Recipient Box */}
                <div className="bg-surface-50 p-6 rounded-2xl mb-12 flex justify-between items-center border border-surface-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-surface-300 mb-1">Prepared For</p>
                        <p className="text-sm font-black italic">{isReceipt ? receipt.customerName || "Customer" : (isInvoice ? invoice.clientName : order.customerName)}</p>
                    </div>
                    {isInvoice && invoice.dueDate && (
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-surface-300 mb-1">Due Date</p>
                            <p className="text-sm font-black text-primary-600">{formatDate(invoice.dueDate)}</p>
                        </div>
                    )}
                </div>

                {/* Items */}
                <div className="flex-1">
                    <div className="grid grid-cols-[1fr,100px] gap-4 mb-4 px-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Description</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 text-right">Amount</span>
                    </div>

                    {isReceipt ? (
                        <div className="bg-white border-2 border-surface-900 p-5 rounded-2xl shadow-[4px_4px_0px_#1a1a1a]">
                            <p className="text-sm font-black mb-1">{receipt.description || "General Purchase"}</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">{receipt.status}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-white border border-surface-100 p-4 rounded-xl group hover:border-primary-500 transition-colors">
                                    <div>
                                        <p className="text-sm font-black">{item.name || "Item"}</p>
                                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{item.quantity} QTY × {formatCurrency(item.price)}</p>
                                    </div>
                                    <p className="text-sm font-black">{formatCurrency(item.quantity * item.price)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Totals Box */}
                <div className="mt-12 bg-surface-900 text-white p-8 rounded-[2rem] flex flex-col gap-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />

                    {isInvoice && includeVat && (
                        <div className="flex justify-between items-center text-xs opacity-60 font-bold uppercase tracking-widest">
                            <span>Subtotal + VAT ({vatRate}%)</span>
                            <span>{formatCurrency(subtotal + tax)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Total Due</span>
                        <span className="text-3xl font-black tracking-tighter text-primary-400">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>

                <Branding />
            </div>
        </div>
    );
}
