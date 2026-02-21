"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input, SegmentedControl, CurrencyInput, TextArea } from "@/components/ui/FormInput";
import LivePreview from "@/components/LivePreview";
import { LogoUpload } from "@/components/ui/LogoUpload";
import { ReceiptData } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { getDocumentById } from "@/lib/StorageUtils";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";

export default function ReceiptForm() {
    const searchParams = useSearchParams();
    const docId = searchParams.get("id");

    const [formData, setFormData] = useState<ReceiptData>({
        businessName: "",
        customerName: "",
        description: "",
        amount: 0,
        status: "Paid",
        paymentMethod: "Transfer",
        date: new Date().toISOString().split("T")[0],
        logoUrl: undefined,
        bankDetails: {
            bankName: "",
            accountNumber: "",
            accountName: "",
            enabled: false,
        },
        deliveryInfo: {
            location: "",
            cost: 0,
            enabled: false,
        },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mode, setMode] = useState<"edit" | "preview">("edit");

    useEffect(() => {
        if (docId) {
            const doc = getDocumentById(docId);
            if (doc && doc.type === "receipt") {
                const data = doc.data as ReceiptData;
                // Ensure new fields exist for legacy docs
                setFormData({
                    ...data,
                    bankDetails: data.bankDetails || { bankName: "", accountNumber: "", accountName: "", enabled: false },
                    deliveryInfo: data.deliveryInfo || { location: "", cost: 0, enabled: false },
                });
                setMode("preview");
            }
        }
    }, [docId]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
        if (!formData.description.trim()) newErrors.description = "Tell us what this receipt is for";
        if (formData.amount <= 0) newErrors.amount = "Amount must be greater than ₦0";

        if (formData.bankDetails?.enabled) {
            if (!formData.bankDetails.bankName.trim()) newErrors.bankName = "Bank name required";
            if (!formData.bankDetails.accountName.trim()) newErrors.accountName = "Account name required";
            if (formData.bankDetails.accountNumber.length !== 10) {
                newErrors.accountNumber = "Account number must be exactly 10 digits";
            }
        }

        if (formData.deliveryInfo?.enabled) {
            if (!formData.deliveryInfo.location.trim()) newErrors.deliveryLocation = "Location required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const deliveryCost = useMemo(() => {
        return formData.deliveryInfo?.enabled ? formData.deliveryInfo.cost : 0;
    }, [formData.deliveryInfo]);

    const total = useMemo(() => formData.amount + deliveryCost, [formData.amount, deliveryCost]);

    const handleChange = (field: keyof ReceiptData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleNestedChange = (parent: "bankDetails" | "deliveryInfo", field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent] as any),
                [field]: value
            }
        }));

        // Clear specific errors
        if (errors[field] || errors.bankName || errors.accountName || errors.accountNumber || errors.deliveryLocation) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                if (field === "bankName") delete newErrors.bankName;
                if (field === "accountName") delete newErrors.accountName;
                if (field === "accountNumber") delete newErrors.accountNumber;
                if (field === "location") delete newErrors.deliveryLocation;
                return newErrors;
            });
        }
    };

    const handleModeSwitch = (newMode: "edit" | "preview") => {
        if (newMode === "preview") {
            if (validate()) {
                setMode("preview");
            }
        } else {
            setMode("edit");
        }
    };

    return (
        <PageTransition>
            <div className="flex flex-col gap-6 pb-20">
                {/* Mobile Tab Switcher */}
                <div className="flex p-1 bg-surface-100 rounded-2xl border border-surface-200">
                    <button
                        onClick={() => handleModeSwitch("edit")}
                        className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "edit" ? "bg-white text-primary-500 shadow-sm" : "text-surface-400"
                            }`}
                    >
                        1. Edit Form
                    </button>
                    <button
                        onClick={() => handleModeSwitch("preview")}
                        className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "preview" ? "bg-white text-primary-500 shadow-sm" : "text-surface-400"
                            }`}
                    >
                        2. Live Preview
                    </button>
                </div>

                {mode === "edit" ? (
                    <StaggerContainer>
                        <div className="flex flex-col gap-8">
                            <StaggerItem>
                                <LogoUpload
                                    value={formData.logoUrl}
                                    onChange={(url) => handleChange("logoUrl", url)}
                                />
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400 px-1">Business & Customer</h3>
                                    <Input
                                        label="BUSINESS NAME"
                                        placeholder="Enter business name"
                                        value={formData.businessName}
                                        onChange={(e) => handleChange("businessName", e.target.value)}
                                        error={errors.businessName}
                                    />
                                    <Input
                                        label="CUSTOMER NAME (OPTIONAL)"
                                        placeholder="Enter customer name"
                                        value={formData.customerName}
                                        onChange={(e) => handleChange("customerName", e.target.value)}
                                    />
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400 px-1">Payment Details</h3>
                                    <TextArea
                                        label="ITEM / DESCRIPTION"
                                        placeholder="What is this payment for?"
                                        value={formData.description}
                                        onChange={(e: any) => handleChange("description", e.target.value)}
                                        className="min-h-[80px]"
                                        error={errors.description}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <CurrencyInput
                                            label="AMOUNT"
                                            value={formData.amount}
                                            onChange={(val) => handleChange("amount", val)}
                                            error={errors.amount}
                                        />
                                        <Input
                                            label="DATE"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => handleChange("date", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SegmentedControl
                                            label="STATUS"
                                            options={["Paid", "Deposit", "Due"]}
                                            value={formData.status}
                                            onChange={(val) => handleChange("status", val)}
                                        />
                                        <SegmentedControl
                                            label="METHOD"
                                            options={["Transfer", "Cash", "POS", "Card"]}
                                            value={formData.paymentMethod}
                                            onChange={(val) => handleChange("paymentMethod", val)}
                                        />
                                    </div>
                                </section>
                            </StaggerItem>

                            {/* Bank Details Section */}
                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500/10">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400">Bank Details</h3>
                                        <button
                                            onClick={() => handleNestedChange("bankDetails", "enabled", !formData.bankDetails?.enabled)}
                                            className={`w-10 h-6 rounded-full transition-all relative ${formData.bankDetails?.enabled ? 'bg-primary-500' : 'bg-surface-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.bankDetails?.enabled ? 'left-5' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {formData.bankDetails?.enabled && (
                                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Input
                                                label="BANK NAME"
                                                placeholder="e.g. Zenith Bank"
                                                value={formData.bankDetails.bankName}
                                                onChange={(e) => handleNestedChange("bankDetails", "bankName", e.target.value)}
                                                error={errors.bankName}
                                                className="bg-surface-50 border-none"
                                            />
                                            <Input
                                                label="ACCOUNT NAME"
                                                placeholder="e.g. John Doe Store"
                                                value={formData.bankDetails.accountName}
                                                onChange={(e) => handleNestedChange("bankDetails", "accountName", e.target.value)}
                                                error={errors.accountName}
                                                className="bg-surface-50 border-none"
                                            />
                                            <Input
                                                label="ACCOUNT NUMBER"
                                                placeholder="10 Digits"
                                                type="number"
                                                value={formData.bankDetails.accountNumber}
                                                onChange={(e) => {
                                                    const val = e.target.value.slice(0, 10);
                                                    handleNestedChange("bankDetails", "accountNumber", val);
                                                }}
                                                error={errors.accountNumber}
                                                className="bg-surface-50 border-none"
                                            />
                                        </div>
                                    )}
                                </section>
                            </StaggerItem>

                            {/* Delivery Details Section */}
                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500/10">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400">Delivery</h3>
                                        <button
                                            onClick={() => handleNestedChange("deliveryInfo", "enabled", !formData.deliveryInfo?.enabled)}
                                            className={`w-10 h-6 rounded-full transition-all relative ${formData.deliveryInfo?.enabled ? 'bg-primary-500' : 'bg-surface-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.deliveryInfo?.enabled ? 'left-5' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {formData.deliveryInfo?.enabled && (
                                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Input
                                                label="DELIVERY LOCATION"
                                                placeholder="e.g. Lekki Phase 1"
                                                value={formData.deliveryInfo.location}
                                                onChange={(e) => handleNestedChange("deliveryInfo", "location", e.target.value)}
                                                error={errors.deliveryLocation}
                                                className="bg-surface-50 border-none"
                                            />
                                            <CurrencyInput
                                                label="DELIVERY COST"
                                                value={formData.deliveryInfo.cost}
                                                onChange={(val) => handleNestedChange("deliveryInfo", "cost", val)}
                                                className="bg-surface-50 border-none"
                                            />
                                        </div>
                                    )}
                                </section>
                            </StaggerItem>
                        </div>
                    </StaggerContainer>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 transition-all duration-500">
                        <LivePreview
                            data={formData}
                            type="receipt"
                            initialTemplate={searchParams.get("template") as any || "minimalist"}
                        />
                    </div>
                )}

                <StaggerContainer delayChildren={0.5}>
                    <StaggerItem>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-lg mb-6 mx-2 -mt-4 relative z-10">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                    <span className="uppercase tracking-widest text-[10px] font-black opacity-50">Base Amount</span>
                                    <span className="font-bold text-surface-900">₦{formData.amount.toLocaleString()}</span>
                                </div>
                                {formData.deliveryInfo?.enabled && (
                                    <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                        <span className="uppercase tracking-widest text-[10px] font-black opacity-50">Delivery</span>
                                        <span className="font-bold text-surface-900">₦{formData.deliveryInfo.cost.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-4 border-t border-surface-100">
                                    <span className="text-sm font-black text-surface-900 uppercase tracking-widest italic">Total Paid</span>
                                    <span className="text-2xl font-black text-primary-500 tracking-tighter">₦{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </StaggerItem>
                    <StaggerItem>
                        <div className="flex flex-col gap-4 mt-4">
                            <button
                                onClick={() => handleModeSwitch("preview")}
                                className="w-full bg-primary-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="21 8 21 21 3 21 3 8" />
                                    <rect x="1" y="3" width="22" height="5" />
                                    <line x1="10" y1="12" x2="14" y2="12" />
                                </svg>
                                Generate Receipt
                            </button>
                            <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.15em] text-center">
                                RECEIPTS ARE SAVED TO YOUR DASHBOARD
                            </p>
                        </div>
                    </StaggerItem>
                </StaggerContainer>
            </div>
        </PageTransition>
    );
}
