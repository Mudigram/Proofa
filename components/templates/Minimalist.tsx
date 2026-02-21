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

export default function MinimalistTemplate({ data, type }: TemplateProps) {
    const isReceipt = type === "receipt";
    const isInvoice = type === "invoice";
    const isOrder = type === "order";

    const receipt = data as ReceiptData;
    const invoice = data as InvoiceData;
    const order = data as OrderData;

    const logoUrl = data.logoUrl;

    // Calculate totals for multi-item documents
    const items = isReceipt ? [] : (isInvoice ? invoice.items : order.items);
    const subtotal = isReceipt ? receipt.amount : items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = isInvoice ? subtotal * 0.075 : 0;
    const total = isReceipt ? receipt.amount : (isOrder ? order.totalAmount : subtotal + tax);

    return (
        <div className="relative bg-white p-10 min-h-[600px] flex flex-col font-sans text-surface-900 shadow-2xl mx-auto max-w-[500px] border border-surface-100 overflow-hidden font-heading" id="document-preview">
            <Watermark />

            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter mb-1">
                        {isReceipt ? "Payment Receipt" : (isInvoice ? "Invoice" : "Order Summary")}
                    </h1>
                    <p className="text-xs text-surface-400 font-bold tracking-widest uppercase">
                        {isInvoice ? `#${invoice.invoiceNumber}` : (isReceipt ? `Ref: ${Math.floor(Math.random() * 100000)}` : "Order Ref")}
                    </p>
                </div>
                <div className="text-right">
                    <div className="w-12 h-12 bg-surface-900 rounded-full flex items-center justify-center text-white ml-auto mb-2 font-black italic overflow-hidden">
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt="Logo"
                                width={48}
                                height={48}
                                unoptimized
                                className="w-full h-full object-contain rounded-full"
                            />
                        ) : (
                            "P"
                        )}
                    </div>
                    <p className="text-sm font-black tracking-tight">{isOrder ? "Proofa Store" : (isReceipt ? receipt.businessName : invoice.businessName)}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-12 pb-8 border-b border-surface-100">
                <div>
                    <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest mb-1.5"> {isReceipt ? "From" : "Billed By"}</p>
                    <p className="text-xs font-bold">{isInvoice ? invoice.businessName : (isReceipt ? receipt.businessName : "Proofa Store")}</p>
                    <p className="text-[10px] text-surface-400 font-medium leading-relaxed max-w-[150px] mt-1">
                        {isInvoice ? invoice.businessAddress : "Nigeria"}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest mb-1.5">{isReceipt ? "Customer" : "Billed To"}</p>
                    <p className="text-xs font-bold leading-tight">{isReceipt ? receipt.customerName || "Customer" : (isInvoice ? invoice.clientName : order.customerName)}</p>
                    <p className="text-[10px] text-surface-400 font-medium mt-1">
                        Dated: {formatDate(isReceipt ? receipt.date : (isInvoice ? invoice.issueDate : new Date().toISOString()))}
                    </p>
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-1">
                <div className="flex items-center justify-between py-2 border-b-2 border-surface-900 mb-4 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest">Description</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Total</span>
                </div>

                {isReceipt ? (
                    <div className="flex justify-between items-start py-4 px-1 border-b border-surface-50">
                        <div className="flex-1 mr-4">
                            <p className="text-xs font-bold mb-0.5">{receipt.description || "Payment for services"}</p>
                            <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wider">{receipt.status}</p>
                        </div>
                        <p className="text-xs font-black">{formatCurrency(receipt.amount)}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start px-1">
                                <div className="flex-1 mr-4">
                                    <p className="text-xs font-bold mb-0.5">{item.name || "Unnamed Item"}</p>
                                    <p className="text-[10px] text-surface-400 font-medium">{item.quantity} × {formatCurrency(item.price)}</p>
                                </div>
                                <p className="text-xs font-black">{formatCurrency(item.quantity * item.price)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Section */}
            <div className="mt-12 pt-8 border-t-2 border-surface-900 flex flex-col gap-2">
                {isInvoice && (
                    <>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-surface-400 font-bold uppercase tracking-widest">Subtotal</span>
                            <span className="font-bold">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-surface-400 font-bold uppercase tracking-widest">VAT (7.5%)</span>
                            <span className="font-bold">{formatCurrency(tax)}</span>
                        </div>
                    </>
                )}
                <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-black uppercase tracking-widest">Total Amount</span>
                    <span className="text-xl font-black">{formatCurrency(total)}</span>
                </div>
            </div>

            {isInvoice && invoice.notes && (
                <div className="mt-8">
                    <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest mb-1.5">Notes</p>
                    <p className="text-[10px] text-surface-500 font-medium leading-relaxed italic border-l-2 border-surface-100 pl-3">
                        {invoice.notes}
                    </p>
                </div>
            )}

            {/* Status Badge for Order/Receipt */}
            {(isOrder || isReceipt) && (
                <div className="mt-8 flex justify-center">
                    <div className="px-4 py-1.5 border border-surface-900 text-[10px] font-black uppercase tracking-[0.2em]">
                        {isReceipt ? receipt.status : order.deliveryStatus}
                    </div>
                </div>
            )}

            <Branding />
        </div>
    );
}
