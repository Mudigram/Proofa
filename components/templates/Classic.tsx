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

export default function ClassicTemplate({ data, type }: TemplateProps) {
    const isReceipt = type === "receipt";
    const isInvoice = type === "invoice";
    const isOrder = type === "order";

    const receipt = data as ReceiptData;
    const invoice = data as InvoiceData;
    const order = data as OrderData;

    const items = isReceipt ? [] : (isInvoice ? invoice.items : order.items);
    const subtotal = isReceipt ? receipt.amount : items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const vatRate = isInvoice ? (invoice.vatRate ?? 7.5) : 0;
    const includeVat = isInvoice ? (invoice.includeVat ?? true) : false;
    const tax = includeVat ? subtotal * (vatRate / 100) : 0;
    const deliveryCost = data.deliveryInfo?.enabled ? (data.deliveryInfo.cost ?? 0) : 0;
    const total = (isReceipt ? receipt.amount : (isOrder ? order.totalAmount : subtotal + tax)) + deliveryCost;

    return (
        <div className="relative bg-white min-h-[600px] flex flex-col font-mono text-zinc-800 mx-auto max-w-[480px] shadow-2xl p-8" id="document-preview">
            <Watermark />

            {/* 1. MINIMAL LETTERHEAD */}
            <div className="flex flex-col items-center border-b-2 border-zinc-900 pb-4 mb-4">
                {data.logoUrl && (
                    <div className="w-16 h-16 mb-2 grayscale">
                        <Image src={data.logoUrl} alt="Logo" width={64} height={64} unoptimized className="object-contain" />
                    </div>
                )}
                <h1 className="text-xl font-bold uppercase tracking-[0.2em]">
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
            <div className="grid grid-cols-12 border-y border-zinc-900 py-2 text-[9px] font-black uppercase tracking-widest mb-4">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Description</div>
                <div className="col-span-4 text-right">Amount</div>
            </div>

            {/* 4. ITEMS LIST */}
            <div className="flex-1 space-y-3">
                {isReceipt ? (
                    <div className="grid grid-cols-12 text-xs">
                        <div className="col-span-1">01</div>
                        <div className="col-span-7 font-bold uppercase">{receipt.description || "General Purchase"}</div>
                        <div className="col-span-4 text-right font-bold">{formatCurrency(receipt.amount)}</div>
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-12 text-xs items-baseline">
                            <div className="col-span-1 text-zinc-400">{idx + 1}</div>
                            <div className="col-span-7 flex flex-col">
                                <span className="font-bold uppercase leading-none">{item.name}</span>
                                <span className="text-[9px] text-zinc-500 mt-1">{item.quantity} x {formatCurrency(item.price)}</span>
                            </div>
                            <div className="col-span-4 text-right font-bold">{formatCurrency(item.quantity * item.price)}</div>
                        </div>
                    ))
                )}
            </div>

            {/* 5. SUMMARY LEDGER */}
            <div className="border-t border-zinc-200 pt-4 flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] uppercase">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                {isInvoice && includeVat && (
                    <div className="flex justify-between text-[10px] uppercase">
                        <span>VAT ({vatRate}%)</span>
                        <span>{formatCurrency(tax)}</span>
                    </div>
                )}
                {data.deliveryInfo?.enabled && (
                    <div className="flex justify-between text-[10px] uppercase">
                        <span>Delivery</span>
                        <span>{formatCurrency(deliveryCost)}</span>
                    </div>
                )}
                <div className="flex justify-between border-t-2 border-zinc-900 mt-2 pt-2">
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Total Due</span>
                    <span className="text-xl font-black">{formatCurrency(total)}</span>
                </div>
            </div>

            {/* 6. BANK INFO (Clean & Integrated) */}
            {data.bankDetails?.enabled && (
                <div className="mt-6 pt-4 border-t border-dotted border-zinc-300">
                    <p className="text-[8px] font-bold uppercase text-zinc-400 mb-2">Payment Information</p>
                    <div className="flex justify-between text-[10px] font-bold">
                        <span>{data.bankDetails.bankName} / {data.bankDetails.accountName}</span>
                        <span className="tracking-widest">{data.bankDetails.accountNumber}</span>
                    </div>
                </div>
            )}

            {/* 7. FOOTER */}
            <div className="mt-auto pt-2 flex justify-between items-center text-[8px] uppercase tracking-tighter text-zinc-400">
                <p>{data.terms || "Goods sold are not returnable."}</p>
                <Branding />
            </div>
        </div>
    );
}