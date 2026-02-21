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

    const logoUrl = data.logoUrl;

    const items = isReceipt ? [] : (isInvoice ? invoice.items : order.items);
    const subtotal = isReceipt ? receipt.amount : items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    // Dynamic Tax Calculation
    const vatRate = isInvoice ? (invoice.vatRate ?? 8.5) : 0;
    const includeVat = isInvoice ? (invoice.includeVat ?? true) : false;
    const tax = includeVat ? subtotal * (vatRate / 100) : 0;

    const deliveryCost = data.deliveryInfo?.enabled ? (data.deliveryInfo.cost ?? 0) : 0;
    const total = (isReceipt ? receipt.amount : (isOrder ? order.totalAmount : subtotal + tax)) + deliveryCost;

    return (
        <div className="relative bg-white min-h-[700px] flex flex-col font-mono text-[#2d3436] mx-auto max-w-[450px] shadow-2xl overflow-visible font-heading" id="document-preview">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            <Watermark />

            <div className="p-4 flex-1 flex flex-col items-center text-center relative z-10">
                {/* Central Logo Header */}
                <div className="">
                    {logoUrl ? (
                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl mb-4 overflow-hidden bg-white">
                            <Image
                                src={logoUrl}
                                alt="Logo"
                                width={80}
                                height={80}
                                unoptimized
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-[#eb4d4b] rounded-[1.5rem] flex items-center justify-center text-white shadow-lg mb-6 transform rotate-3">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                <path d="M3 6h18" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                    )}

                    <h1 className="text-2xl font-black uppercase tracking-[0.15em] text-[#000] mb-2 leading-tight">
                        {isOrder ? "Proofa Premium" : (isReceipt ? receipt.businessName : invoice.businessName)}
                    </h1>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest max-w-[250px]">
                        {isInvoice ? invoice.businessAddress : "123 DESIGN AVENUE, CREATIVE SUITE 404"}
                    </p>
                    <p className="text-[9px] text-surface-300 font-bold mt-2 uppercase tracking-tighter">
                        {formatDate(isReceipt ? receipt.date : (isInvoice ? invoice.issueDate : new Date().toISOString()))} • 02:45 PM
                    </p>
                </div>

            </div>

            {/* Recipient Details (Modern Classic) */}
            <div className="w-full flex justify-between items-start mb-2 px-2 text-left">
                <div>
                    <p className="text-[8px] font-black text-surface-300 uppercase tracking-widest mb-1">Customer</p>
                    <p className="text-xs font-black uppercase">{isReceipt ? receipt.customerName || "Customer" : (isInvoice ? invoice.clientName : order.customerName)}</p>
                    {(isReceipt ? receipt.customerPhone : (isInvoice ? invoice.clientPhone : order.customerPhone)) && (
                        <p className="text-[9px] font-bold text-surface-400 mt-0.5">
                            {isReceipt ? receipt.customerPhone : (isInvoice ? invoice.clientPhone : order.customerPhone)}
                        </p>
                    )}
                </div>
                {isInvoice && invoice.dueDate && (
                    <div className="text-right">
                        <p className="text-[8px] font-black text-surface-300 uppercase tracking-widest mb-1">Payment Due</p>
                        <p className="text-xs font-black uppercase text-[#eb4d4b]">{formatDate(invoice.dueDate)}</p>
                    </div>
                )}
            </div>

            {/* Dashed separator */}
            <div className="w-full border-b-[3px] border-dashed border-surface-600 my-6" />

            {/* Item List */}
            <div className="w-full flex flex-col gap-2 text-left">
                {isReceipt ? (
                    <div className="flex justify-between items-baseline group">
                        <div className="flex gap-2">
                            <span className="text-surface-400 font-bold">1x</span>
                            <span className="font-bold text-sm tracking-tight">{receipt.description || "General Purchase"}</span>
                        </div>
                        <span className="font-bold text-sm">{formatCurrency(receipt.amount)}</span>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="flex justify-between items-baseline">
                            <div className="flex gap-2">
                                <span className="text-surface-400 font-bold">{item.quantity}x</span>
                                <span className="font-bold text-sm tracking-tight">{item.name || "Item"}</span>
                            </div>
                            <span className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Dotted separator */}
            <div className="w-full border-b-[3px] border-dotted border-surface-600 my-8" />

            {/* Summary */}
            <div className="w-full flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold text-surface-400">
                    <span className="uppercase tracking-widest">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                {isInvoice && includeVat && (
                    <div className="flex justify-between items-center text-xs font-bold text-surface-400">
                        <span className="uppercase tracking-widest">Tax ({vatRate}%)</span>
                        <span>{formatCurrency(tax)}</span>
                    </div>
                )}
                {data.deliveryInfo?.enabled && (
                    <div className="flex justify-between items-center text-xs font-bold text-surface-400">
                        <span className="uppercase tracking-widest">Delivery</span>
                        <span>{formatCurrency(data.deliveryInfo.cost)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center mt-2 pt-4 border-t border-surface-50">
                    <span className="text-xl font-black uppercase tracking-[0.2em] text-[#eb4d4b]">TOTAL</span>
                    <span className="text-2xl font-black text-[#eb4d4b] tracking-tighter">{formatCurrency(total)}</span>
                </div>
            </div>

            {data.bankDetails?.enabled && (
                <div className="w-full mt-6 flex flex-col bg-surface-50/50 p-4 rounded-2xl border-2 border-dashed border-surface-200">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-surface-300 mb-3 text-center">Transfer Details</p>
                    <div className="flex justify-between items-end px-2">
                        <div>
                            <p className="text-xs font-black uppercase mb-0.5">{data.bankDetails.bankName}</p>
                            <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">{data.bankDetails.accountName}</p>
                        </div>
                        <div className="text-sm font-black tracking-[0.1em] px-3 py-1.5 bg-white rounded-lg shadow-sm border border-surface-100">
                            {data.bankDetails.accountNumber}
                        </div>
                    </div>
                </div>
            )}



            {data.terms && (
                <div className="w-full mt-2 p-4 border border-surface-200 rounded-xl relative overflow-hidden bg-surface-50/30">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#eb4d4b]" />
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-2">Terms & Conditions</p>
                    <p className="text-[10px] font-bold text-left italic leading-relaxed">{data.terms}</p>
                </div>
            )}


            <Branding />

            {/* Serrated Bottom Edge */}
            <div className="absolute -bottom-6 left-0 right-0 h-8 bg-white z-20 overflow-hidden">
                <div className="flex w-[200%] animate-none">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-4 h-4 bg-surface-100/50 transform rotate-45 -translate-y-1/2"
                            style={{ marginLeft: '-1px' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
