"use client";

import React, { useState, useEffect } from "react";
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
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mode, setMode] = useState<"edit" | "preview">("edit");

    useEffect(() => {
        if (docId) {
            const doc = getDocumentById(docId);
            if (doc && doc.type === "receipt") {
                setFormData(doc.data as ReceiptData);
                setMode("preview");
            }
        }
    }, [docId]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
        if (!formData.description.trim()) newErrors.description = "Tell us what this receipt is for";
        if (formData.amount <= 0) newErrors.amount = "Amount must be greater than ₦0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof ReceiptData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
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
                        <div className="flex flex-col gap-10">
                            <StaggerItem>
                                <LogoUpload
                                    value={formData.logoUrl}
                                    onChange={(url) => handleChange("logoUrl", url)}
                                />
                            </StaggerItem>

                            <StaggerItem>
                                <Input
                                    label="BUSINESS NAME"
                                    placeholder="Enter business name"
                                    value={formData.businessName}
                                    onChange={(e) => handleChange("businessName", e.target.value)}
                                    className="bg-white border-surface-200"
                                    error={errors.businessName}
                                />
                            </StaggerItem>

                            <StaggerItem>
                                <Input
                                    label="CUSTOMER NAME (OPTIONAL)"
                                    placeholder="Enter customer name"
                                    value={formData.customerName}
                                    onChange={(e) => handleChange("customerName", e.target.value)}
                                    className="bg-white border-surface-200"
                                />
                            </StaggerItem>

                            <StaggerItem>
                                <TextArea
                                    label="ITEM / DESCRIPTION"
                                    placeholder="What is this payment for?"
                                    value={formData.description}
                                    onChange={(e: any) => handleChange("description", e.target.value)}
                                    className="bg-white border-surface-200 min-h-[100px]"
                                    error={errors.description}
                                />
                            </StaggerItem>

                            <StaggerItem>
                                <div className="grid grid-cols-2 gap-4">
                                    <CurrencyInput
                                        label="AMOUNT"
                                        value={formData.amount}
                                        onChange={(val) => handleChange("amount", val)}
                                        className="bg-white border-surface-200"
                                        error={errors.amount}
                                    />

                                    <Input
                                        label="DATE"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleChange("date", e.target.value)}
                                        className="bg-white border-surface-200"
                                    />
                                </div>
                            </StaggerItem>

                            <StaggerItem>
                                <SegmentedControl
                                    label="PAYMENT STATUS"
                                    options={["Paid", "Deposit", "Due"]}
                                    value={formData.status}
                                    onChange={(val) => handleChange("status", val)}
                                />
                            </StaggerItem>

                            <StaggerItem>
                                <SegmentedControl
                                    label="PAYMENT METHOD"
                                    options={["Transfer", "Cash", "POS", "Card"]}
                                    value={formData.paymentMethod}
                                    onChange={(val) => handleChange("paymentMethod", val)}
                                />
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
