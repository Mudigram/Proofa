"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input, CurrencyInput, TextArea } from "@/components/ui/FormInput";
import { LogoUpload } from "@/components/ui/LogoUpload";
import LivePreview from "@/components/LivePreview";
import { InvoiceData, LineItem } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { getDocumentById } from "@/lib/StorageUtils";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import { formatCurrency, formatDate } from "@/components/templates/TemplateUtils";

export default function InvoiceForm() {
    const searchParams = useSearchParams();
    const docId = searchParams.get("id");

    const [formData, setFormData] = useState<InvoiceData>({
        businessName: "",
        businessAddress: "",
        clientName: "",
        invoiceNumber: "INV-" + Math.floor(Math.random() * 9000 + 1000),
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        items: [{ id: "1", name: "", quantity: 1, price: 0 }],
        notes: "",
        logoUrl: undefined,
        includeVat: true,
        vatRate: 7.5,
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

    const subtotal = useMemo(() => {
        return formData.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    }, [formData.items]);

    const tax = useMemo(() => {
        return formData.includeVat ? subtotal * ((formData.vatRate || 0) / 100) : 0;
    }, [subtotal, formData.includeVat, formData.vatRate]);

    const deliveryCost = useMemo(() => {
        return formData.deliveryInfo?.enabled ? formData.deliveryInfo.cost : 0;
    }, [formData.deliveryInfo]);

    const total = useMemo(() => subtotal + tax + deliveryCost, [subtotal, tax, deliveryCost]);

    useEffect(() => {
        if (docId) {
            const doc = getDocumentById(docId);
            if (doc && doc.type === "invoice") {
                const data = doc.data as InvoiceData;
                setFormData({
                    ...data,
                    bankDetails: data.bankDetails || { bankName: "", accountNumber: "", accountName: "", enabled: false },
                    deliveryInfo: data.deliveryInfo || { location: "", cost: 0, enabled: false },
                });
                setMode("preview");
            }
        }
    }, [docId]);

    const handleChange = (field: keyof InvoiceData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Cleanup errors
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

    const updateItem = (index: number, field: keyof LineItem, value: any) => {
        // ... existing updateItem code
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        const newItem = {
            id: Math.random().toString(36).substring(2, 9),
            name: "",
            quantity: 1,
            price: 0,
        };
        setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (id: string) => {
        if (formData.items.length === 1) return;
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== id),
        }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.businessName.trim()) newErrors.businessName = "Required";
        if (!formData.clientName.trim()) newErrors.clientName = "Required";

        if (formData.bankDetails?.enabled) {
            if (!formData.bankDetails.bankName.trim()) newErrors.bankName = "Required";
            if (!formData.bankDetails.accountName.trim()) newErrors.accountName = "Required";
            if (formData.bankDetails.accountNumber.length !== 10) {
                newErrors.accountNumber = "Must be 10 digits";
            }
        }

        if (formData.deliveryInfo?.enabled) {
            if (!formData.deliveryInfo.location.trim()) newErrors.deliveryLocation = "Required";
        }

        let itemsValid = true;
        formData.items.forEach((item) => {
            if (!item.name.trim()) itemsValid = false;
        });
        if (!itemsValid) newErrors.items = "Please fill all item names";
        if (formData.items.length === 0) newErrors.items = "Add at least one item";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400 px-1">Business Details</h3>
                                    <Input
                                        label="BUSINESS NAME"
                                        placeholder="Your Company"
                                        value={formData.businessName}
                                        onChange={(e) => handleChange("businessName", e.target.value)}
                                        error={errors.businessName}
                                    />
                                    <TextArea
                                        label="ADDRESS (OPTIONAL)"
                                        placeholder="City, State, Zip"
                                        value={formData.businessAddress || ""}
                                        onChange={(e: any) => handleChange("businessAddress", e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400 px-1">Client & Invoice Info</h3>
                                    <div className="flex flex-col gap-4">
                                        <Input
                                            label="CLIENT NAME"
                                            placeholder="Who are you billing?"
                                            value={formData.clientName}
                                            onChange={(e) => handleChange("clientName", e.target.value)}
                                            error={errors.clientName}
                                        />
                                        <Input
                                            label="CLIENT PHONE (OPTIONAL)"
                                            placeholder="e.g. 09012345678"
                                            value={formData.clientPhone || ""}
                                            onChange={(e) => handleChange("clientPhone", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="INVOICE #"
                                            value={formData.invoiceNumber}
                                            onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                                        />
                                        <Input
                                            label="DATE"
                                            type="date"
                                            value={formData.issueDate}
                                            onChange={(e) => handleChange("issueDate", e.target.value)}
                                        />
                                    </div>
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400">Line Items</h3>
                                        <button
                                            onClick={addItem}
                                            className="text-primary-600 text-[10px] font-black uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full"
                                        >
                                            + Add Item
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {formData.items.map((item, index) => (
                                            <div key={item.id} className="flex flex-col gap-3 p-4 bg-surface-50 rounded-2xl relative">
                                                {formData.items.length > 1 && (
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-white shadow-sm border border-surface-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors z-10"
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                                <Input
                                                    label="NAME"
                                                    placeholder="Item name"
                                                    value={item.name}
                                                    onChange={(e) => updateItem(index, "name", e.target.value)}
                                                    className="bg-white"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input
                                                        label="QTY"
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                                        className="bg-white"
                                                    />
                                                    <CurrencyInput
                                                        label="PRICE"
                                                        value={item.price}
                                                        onChange={(val) => updateItem(index, "price", val)}
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.items && <p className="text-red-500 text-[10px] font-bold mt-2 px-1">{errors.items}</p>}
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500/10">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400">Tax Settings</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-surface-300">Include VAT</span>
                                            <button
                                                onClick={() => handleChange("includeVat", !formData.includeVat)}
                                                className={`w-10 h-6 rounded-full transition-all relative ${formData.includeVat ? 'bg-primary-500' : 'bg-surface-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.includeVat ? 'left-5' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    {formData.includeVat && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Input
                                                label="VAT RATE (%)"
                                                type="number"
                                                placeholder="7.5"
                                                value={formData.vatRate}
                                                onChange={(e) => handleChange("vatRate", parseFloat(e.target.value) || 0)}
                                                className="bg-surface-50 border-none"
                                            />
                                        </div>
                                    )}
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500/10">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400">Bank details</h3>
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
                                                placeholder="e.g. GTBank"
                                                value={formData.bankDetails.bankName}
                                                onChange={(e) => handleNestedChange("bankDetails", "bankName", e.target.value)}
                                                error={errors.bankName}
                                                className="bg-surface-50 border-none"
                                            />
                                            <Input
                                                label="ACCT NAME"
                                                placeholder="e.g. Mudiaga Dev"
                                                value={formData.bankDetails.accountName}
                                                onChange={(e) => handleNestedChange("bankDetails", "accountName", e.target.value)}
                                                error={errors.accountName}
                                                className="bg-surface-50 border-none"
                                            />
                                            <Input
                                                label="ACCT NUMBER"
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
                                                placeholder="e.g. Island, Lagos"
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

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400 px-1">Invoice Disclaimers / Terms</h3>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {[
                                            "No refund after payment",
                                            "Validity: 7 Days",
                                            "Balance due on delivery",
                                            "Subject to availability"
                                        ].map(preset => (
                                            <button
                                                key={preset}
                                                onClick={() => handleChange("terms", formData.terms === preset ? "" : preset)}
                                                className={`text-[9px] font-bold px-3 py-1.5 rounded-full border transition-all ${formData.terms === preset
                                                    ? "bg-primary-500 text-white border-primary-500"
                                                    : "bg-surface-50 text-surface-500 border-surface-200 hover:border-primary-200"
                                                    }`}
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                    <TextArea
                                        label="CUSTOM TERMS"
                                        placeholder="e.g. No refund after payment"
                                        value={formData.terms || ""}
                                        onChange={(e: any) => handleChange("terms", e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                </section>
                            </StaggerItem>

                            {/* <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400 px-1">Authorized Signature / Stamp</h3>
                                    <LogoUpload
                                        value={formData.signatureUrl}
                                        onChange={(url) => handleChange("signatureUrl", url)}
                                        label="UPLOAD SIGNATURE"
                                    />
                                </section>
                            </StaggerItem> */}

                            <StaggerItem>
                                <TextArea
                                    label="NOTES (OPTIONAL)"
                                    placeholder="Thank you for your business!"
                                    value={formData.notes || ""}
                                    onChange={(e: any) => handleChange("notes", e.target.value)}
                                    className="bg-white min-h-[100px]"
                                />
                            </StaggerItem>
                        </div>
                    </StaggerContainer>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 transition-all duration-500">
                        <LivePreview
                            data={formData}
                            type="invoice"
                            initialTemplate={searchParams.get("template") as any || "minimalist"}
                        />
                    </div>
                )}

                <StaggerContainer delayChildren={0.5}>
                    <StaggerItem>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-lg mb-6 mx-2 -mt-4 relative z-10">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                    <span className="uppercase tracking-widest text-[10px] font-black opacity-50">Subtotal</span>
                                    <span className="font-bold text-surface-900">{formatCurrency(subtotal)}</span>
                                </div>
                                {formData.includeVat && (
                                    <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                        <span className="uppercase tracking-widest text-[10px] font-black opacity-50">VAT ({formData.vatRate}%)</span>
                                        <span className="font-bold text-surface-900">{formatCurrency(tax)}</span>
                                    </div>
                                )}
                                {formData.deliveryInfo?.enabled && (
                                    <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                        <span className="uppercase tracking-widest text-[10px] font-black opacity-50">Delivery</span>
                                        <span className="font-bold text-surface-900">{formatCurrency(deliveryCost)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-4 border-t border-surface-100">
                                    <span className="text-sm font-black text-surface-900 uppercase tracking-widest italic">Total Amount</span>
                                    <span className="text-2xl font-black text-primary-500 tracking-tighter">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </StaggerItem>
                    <StaggerItem>
                        <div className="flex flex-col gap-4 mt-6">
                            <button
                                onClick={() => handleModeSwitch("preview")}
                                className="w-full bg-primary-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                </svg>
                                GENERATE INVOICE
                            </button>
                            <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.15em] text-center">
                                INVOICES ARE SECURELY SAVED TO HISTORY
                            </p>
                        </div>
                    </StaggerItem>
                </StaggerContainer>
            </div>
        </PageTransition>
    );
}
