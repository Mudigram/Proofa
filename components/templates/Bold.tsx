"use client";

import React from "react";
import Image from "next/image";
import {
    TemplateProps,
    formatCurrency,
    formatDate,
    Watermark,
} from "./TemplateUtils";
import { ReceiptData, InvoiceData, OrderData } from "@/lib/types";

export default function BoldTemplate({ data, type }: TemplateProps) {
    const isReceipt = type === "receipt";
    const isInvoice = type === "invoice";
    const isOrder = type === "order";

    const receipt = data as ReceiptData;
    const invoice = data as InvoiceData;
    const order = data as OrderData;

    const items = isReceipt ? [] : (isInvoice ? invoice.items : order.items);
    const subtotal = isReceipt
        ? receipt.amount
        : items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    const vatRate = isInvoice ? (invoice.vatRate ?? 7.5) : 0;
    const includeVat = isInvoice ? (invoice.includeVat ?? true) : false;
    const tax = includeVat ? subtotal * (vatRate / 100) : 0;

    const deliveryCost = data.deliveryInfo?.enabled ? (data.deliveryInfo.cost ?? 0) : 0;
    const total =
        (isReceipt ? receipt.amount : isOrder ? order.totalAmount : subtotal + tax) +
        deliveryCost;

    const businessName = isInvoice
        ? invoice.businessName
        : isReceipt
            ? receipt.businessName
            : "Proofa Store";

    const clientName = isReceipt
        ? receipt.customerName || "Customer"
        : isInvoice
            ? invoice.clientName
            : order.customerName;

    const clientPhone = isReceipt
        ? receipt.customerPhone
        : isInvoice
            ? invoice.clientPhone
            : order.customerPhone;

    const docDate = formatDate(
        isReceipt
            ? receipt.date
            : isInvoice
                ? invoice.issueDate
                : new Date().toISOString()
    );

    return (
        <div
            id="document-preview"
            className="relative bg-white flex flex-col font-sans text-surface-900 overflow-hidden w-[560px]"
            style={{ fontFamily: "inherit" }}
        >
            {/* ── SPLIT HEADER: dark left panel + white right ── */}
            <div className="flex">

                {/* LEFT: dark brand panel — narrow pill */}
                <div className="bg-surface-900 w-[100px] flex-shrink-0 flex flex-col gap-2 p-5">
                    {/* Logo */}
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                        {data.logoUrl ? (
                            <Image
                                src={data.logoUrl}
                                alt="Logo"
                                width={48}
                                height={48}
                                unoptimized
                                className="object-contain w-full h-full"
                            />
                        ) : (
                            <span className="text-xl font-black text-white italic">P</span>
                        )}
                    </div>
                    {/* Business info sits right under logo */}
                    <div>
                        <p className="text-white text-xs font-black uppercase tracking-tight leading-snug">
                            {businessName}
                        </p>
                        <p className="text-surface-400 text-[9px] font-bold uppercase mt-1 leading-relaxed">
                            {isInvoice ? invoice.businessAddress : "Lagos, Nigeria"}
                        </p>
                    </div>
                </div>

                {/* RIGHT: document type + meta */}
                <div className="flex-1 flex flex-col gap-2 p-3 border-b-4 border-surface-900">
                    {/* Doc type + ref pill — same row */}
                    <div className="flex items-start justify-between gap-2">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-surface-900">
                            {type}
                        </h2>
                        <div className="bg-primary-500 px-2.5 py-1 rounded-full flex-shrink-0 mt-1">
                            <p className="text-white text-[9px] font-black uppercase tracking-widest">
                                {isInvoice ? `#${invoice.invoiceNumber}` : isReceipt ? `REF-${Math.floor(Math.random() * 90000) + 10000}` : "ORDER"}
                            </p>
                        </div>
                    </div>

                    {/* Billed to + date — same row at bottom */}
                    <div className="flex justify-between items-end gap-4 mt-auto">
                        <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase text-surface-400 tracking-widest mb-0.5">Billed To</p>
                            <p className="text-sm font-black uppercase leading-tight truncate">{clientName}</p>
                            {clientPhone && (
                                <p className="text-[10px] font-bold text-surface-400 mt-0.5">{clientPhone}</p>
                            )}
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-[8px] font-black uppercase text-surface-400 tracking-widest mb-0.5">Date</p>
                            <p className="text-[11px] font-black text-surface-600 whitespace-nowrap">{docDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DELIVERY BANNER (only if enabled) ── */}
            {data.deliveryInfo?.enabled && (
                <div className="bg-primary-500 px-6 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Pin icon */}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="flex-shrink-0">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">
                            {data.deliveryInfo.location}
                        </p>
                    </div>
                    <p className="text-white/80 text-[9px] font-black uppercase tracking-widest">
                        Standard Delivery
                    </p>
                </div>
            )}

            {/* ── ITEMS TABLE ── */}
            <div className="px-6 pt-5 pb-2 flex-1">
                {/* Column headers */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-surface-900 mb-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-surface-400 flex-1">Item</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-surface-400 w-20 text-center">Qty × Price</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-surface-400 w-24 text-right">Total</p>
                </div>

                {isReceipt ? (
                    <div className="flex justify-between items-start py-4">
                        <div className="flex gap-3 items-start flex-1">
                            <span className="w-6 h-6 bg-surface-900 text-white rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5">
                                1
                            </span>
                            <div>
                                <p className="text-sm font-black uppercase">{receipt.description || "Payment for services"}</p>
                                <p className="text-[9px] font-bold text-surface-400 uppercase mt-0.5">{receipt.status}</p>
                            </div>
                        </div>
                        <p className="text-sm font-black w-24 text-right">{formatCurrency(receipt.amount)}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-surface-50">
                        {items.map((item, idx) => (
                            <div key={item.id} className="flex justify-between items-center py-3">
                                {/* Index badge + name */}
                                <div className="flex gap-3 items-center flex-1 mr-4">
                                    <span className="w-6 h-6 bg-surface-900 text-white rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0">
                                        {idx + 1}
                                    </span>
                                    <p className="text-xs font-black uppercase leading-tight">{item.name || "Unnamed Item"}</p>
                                </div>
                                {/* Qty × price */}
                                <p className="text-[10px] font-bold text-surface-400 w-20 text-center">
                                    {item.quantity} × {formatCurrency(item.price)}
                                </p>
                                {/* Line total */}
                                <p className="text-xs font-black w-24 text-right">
                                    {formatCurrency(item.quantity * item.price)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── TOTALS: dark block ── */}
            <div className="mx-6 mb-4 rounded-2xl overflow-hidden border-2 border-surface-900">
                {/* Breakdown rows */}
                <div className="bg-surface-50 px-5 py-3 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-surface-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {isInvoice && includeVat && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-surface-500">
                            <span>Tax (VAT {vatRate}%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                    )}
                    {data.deliveryInfo?.enabled && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-surface-500">
                            <span>Shipping / Delivery</span>
                            <span>{formatCurrency(deliveryCost)}</span>
                        </div>
                    )}
                </div>

                {/* Grand total — dark row */}
                <div className="bg-surface-900 px-5 py-4 flex justify-between items-center">
                    <div>
                        <p className="text-[8px] font-black uppercase text-surface-400 tracking-widest">Grand Total</p>
                        <p className="text-xs font-black uppercase text-white tracking-tight mt-0.5">
                            {items.length} item{items.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <span className="text-3xl font-black text-primary-400 tracking-tighter">
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>

            {/* ── NOTES ── */}
            {isInvoice && invoice.notes && (
                <div className="mx-6 mb-4 px-4 py-3 border-l-4 border-primary-500 bg-primary-50 rounded-r-xl">
                    <p className="text-[9px] font-black uppercase text-primary-500 tracking-widest mb-1">Notes</p>
                    <p className="text-[10px] font-medium text-surface-600 leading-relaxed italic">{invoice.notes}</p>
                </div>
            )}

            {/* ── BANK DETAILS ── */}
            {data.bankDetails?.enabled && (
                <div className="mx-6 mb-5 p-4 bg-surface-900 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex-[2] border-r border-white/10 pr-4">
                        <p className="text-[7px] font-black uppercase text-primary-400 tracking-widest">Bank & Payee</p>
                        <p className="text-[11px] font-black text-white uppercase mt-0.5 whitespace-normal leading-snug">
                            {data.bankDetails.bankName} • {data.bankDetails.accountName}
                        </p>
                    </div>
                    <div className="text-right flex-1">
                        <p className="text-[7px] font-black uppercase text-primary-400 tracking-widest">Account Number</p>
                        <p className="text-sm font-black text-white tracking-widest tabular-nums mt-0.5">
                            {data.bankDetails.accountNumber}
                        </p>
                    </div>
                </div>
            )}

            {/* ── FOOTER STRIPE ── */}
            <div className="bg-primary-500 px-6 py-3 flex justify-between items-center">
                <p className="text-[9px] font-black uppercase text-white tracking-widest truncate max-w-[60%]">
                    {data.terms || "Thank you for your business!"}
                </p>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    <p className="text-[9px] font-black uppercase text-white/80 tracking-widest">Verified by Proofa</p>
                </div>
            </div>

            <Watermark />
        </div>
    );
}