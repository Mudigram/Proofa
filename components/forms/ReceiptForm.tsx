"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input, SegmentedControl, CurrencyInput, TextArea, PasteButton } from "@/components/ui/FormInput";
import LivePreview from "@/components/LivePreview";
import { LogoUpload } from "@/components/ui/LogoUpload";
import { BankSelector } from "@/components/ui/BankSelector";
import { ReceiptData, LineItem } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { getDocumentById, saveDocument } from "@/lib/StorageUtils";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

export default function ReceiptForm() {
    const searchParams = useSearchParams();
    const docId = searchParams.get("id");
    const [currentDocId, setCurrentDocId] = useState<string | null>(docId);
    const { profile, isPro } = useAuth();
    const { showToast } = useToast();

    const [formData, setFormData] = useState<ReceiptData>({
        businessName: "",
        customerName: "",
        items: [{ id: "1", name: "", quantity: 1, price: 0 }],
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
                setFormData({
                    ...data,
                    items: data.items || [],
                    bankDetails: data.bankDetails || { bankName: "", accountNumber: "", accountName: "", enabled: false },
                    deliveryInfo: data.deliveryInfo || { location: "", cost: 0, enabled: false },
                });
                setMode("preview");
            }
        } else if (isPro && profile) {
            // Auto-fill brand defaults for Pro users on NEW documents
            setFormData(prev => ({
                ...prev,
                businessName: prev.businessName || profile.businessName || "",
                logoUrl: prev.logoUrl || profile.logoUrl || undefined,
            }));
        }
    }, [docId, profile, isPro]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";

        // Validate items
        let itemsValid = true;
        formData.items.forEach(item => {
            if (!item.name.trim()) itemsValid = false;
        });
        if (!itemsValid) newErrors.items = "Fill all item names";
        if (formData.items.length === 0) newErrors.items = "Add at least one item";

        const currencySymbol = profile?.defaultCurrency === "USD" ? "$" : profile?.defaultCurrency === "GBP" ? "£" : profile?.defaultCurrency === "EUR" ? "€" : "₦";
        if (total <= 0) newErrors.amount = `Total must be greater than ${currencySymbol}0`;

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

    const subtotal = useMemo(() => {
        if (!formData.items || formData.items.length === 0) return formData.amount;
        return formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    }, [formData.items, formData.amount]);

    const total = useMemo(() => subtotal + deliveryCost, [subtotal, deliveryCost]);

    const updateItem = (index: number, field: keyof LineItem, value: any) => {
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

    const handleSaveDraft = async () => {
        const updatedData = { ...formData, status: "Draft" as const };
        const doc = await saveDocument(updatedData, "receipt", searchParams.get("template") as any || "minimalist", undefined, currentDocId || undefined);
        setCurrentDocId(doc.id);
        setFormData(updatedData);
        showToast("Draft saved successfully!", "success");
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
                                        placeholder="Enter business name"
                                        value={formData.businessName}
                                        onChange={(e) => handleChange("businessName", e.target.value)}
                                        error={errors.businessName}
                                    />
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-6 bg-white p-7 rounded-[2.5rem] border border-surface-100 shadow-sm border-b-4 border-b-surface-200">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 px-1">Customer / Client</h3>
                                    <div className="flex flex-col gap-4">
                                        <Input
                                            label="NAME (OPTIONAL)"
                                            placeholder="Who paid you?"
                                            value={formData.customerName || ""}
                                            onChange={(e) => handleChange("customerName", e.target.value)}
                                            className="bg-white"
                                            rightElement={<PasteButton onPaste={(text) => handleChange("customerName", text)} />}
                                        />
                                        <Input
                                            label="PHONE NUMBER (OPTIONAL)"
                                            placeholder="e.g. 08012345678"
                                            type="tel"
                                            value={formData.customerPhone || ""}
                                            onChange={(e) => handleChange("customerPhone", e.target.value)}
                                            className="bg-white"
                                            rightElement={<PasteButton onPaste={(text) => handleChange("customerPhone", text)} />}
                                        />
                                    </div>
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-6 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm relative overflow-hidden">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400">Items / Payment Details</h3>
                                        <button
                                            onClick={addItem}
                                            className="text-primary-600 text-[10px] font-black uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full active:scale-95 transition-all"
                                        >
                                            + Add Item
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {formData.items.map((item, index) => (
                                            <div key={item.id} className="relative bg-surface-50 p-5 rounded-3xl border border-surface-100 flex flex-col gap-4 group">
                                                {formData.items.length > 1 && (
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-surface-100 rounded-full shadow-sm flex items-center justify-center text-red-500 z-10 hover:bg-red-50 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                                <Input
                                                    label="ITEM NAME"
                                                    placeholder="e.g. Graphic Design Service"
                                                    value={item.name}
                                                    onChange={(e) => updateItem(index, "name", e.target.value)}
                                                    className="bg-white border-none"
                                                />
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[9px] font-black text-surface-400 tracking-widest uppercase ml-1">Category</label>
                                                    <div className="flex gap-2">
                                                        {["Product", "Service", "Expense"].map((cat) => (
                                                            <button
                                                                key={cat}
                                                                onClick={() => updateItem(index, "category", cat as any)}
                                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${item.category === cat
                                                                    ? "bg-primary-500 text-white shadow-sm"
                                                                    : "bg-white text-surface-400 border border-surface-100"
                                                                    }`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[9px] font-black text-surface-400 tracking-widest uppercase ml-1">QTY</label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                                            className="bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-surface-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                                        />
                                                    </div>
                                                    <CurrencyInput
                                                        label="PRICE"
                                                        value={item.price}
                                                        onChange={(val) => updateItem(index, "price", val)}
                                                        className="bg-white border-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {errors.items && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.items}</p>}

                                        <div className="flex flex-col gap-4 pt-2 border-t border-surface-100 mt-2">
                                            <Input
                                                label="DATE"
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleChange("date", e.target.value)}
                                                className="bg-surface-50 border-none"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400 px-1">Receipt Status</h3>
                                    <SegmentedControl
                                        label="STATUS"
                                        options={["Paid", "Deposit", "Due"]}
                                        value={formData.status}
                                        onChange={(val: any) => handleChange("status", val)}
                                    />
                                    <SegmentedControl
                                        label="METHOD"
                                        options={["Transfer", "Cash", "POS", "Card"]}
                                        value={formData.paymentMethod}
                                        onChange={(val: any) => handleChange("paymentMethod", val)}
                                    />
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
                                            {/* Bank Selector for Pro Users */}
                                            <BankSelector
                                                onSelect={(bankName, accountName, accountNumber) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        bankDetails: {
                                                            ...prev.bankDetails,
                                                            enabled: true,
                                                            bankName,
                                                            accountName,
                                                            accountNumber
                                                        }
                                                    }));
                                                    // Clear any validation errors
                                                    setErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.bankName;
                                                        delete newErrors.accountName;
                                                        delete newErrors.accountNumber;
                                                        return newErrors;
                                                    });
                                                }}
                                            />

                                            <Input
                                                label="BANK NAME"
                                                placeholder="e.g. Zenith Bank"
                                                value={formData.bankDetails.bankName}
                                                onChange={(e) => handleNestedChange("bankDetails", "bankName", e.target.value)}
                                                error={errors.bankName}
                                                className="bg-surface-50 border-none"
                                                rightElement={<PasteButton onPaste={(text) => handleNestedChange("bankDetails", "bankName", text)} />}
                                            />
                                            <Input
                                                label="ACCOUNT NAME"
                                                placeholder="e.g. John Doe Store"
                                                value={formData.bankDetails.accountName}
                                                onChange={(e) => handleNestedChange("bankDetails", "accountName", e.target.value)}
                                                error={errors.accountName}
                                                className="bg-surface-50 border-none"
                                                rightElement={<PasteButton onPaste={(text) => handleNestedChange("bankDetails", "accountName", text)} />}
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
                                                rightElement={<PasteButton onPaste={(text) => handleNestedChange("bankDetails", "accountNumber", text.slice(0, 10))} />}
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
                                                rightElement={<PasteButton onPaste={(text) => handleNestedChange("deliveryInfo", "location", text)} />}
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
                            docId={currentDocId || undefined}
                        />
                    </div>
                )}

                {/* Footer Summary - Always visible */}
                <StaggerContainer delayChildren={0.5}>
                    <StaggerItem>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-lg mb-6 mx-2 -mt-4 relative z-10">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                    <span className="uppercase tracking-widest text-[10px] font-black opacity-50">Items Total</span>
                                    <span className="font-bold text-surface-900">{profile?.defaultCurrency === "USD" ? "$" : profile?.defaultCurrency === "GBP" ? "£" : profile?.defaultCurrency === "EUR" ? "€" : "₦"}{subtotal.toLocaleString()}</span>
                                </div>
                                {formData.deliveryInfo?.enabled && (
                                    <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                        <span className="uppercase tracking-widest text-[10px] font-black opacity-50">Delivery</span>
                                        <span className="font-bold text-surface-900">{profile?.defaultCurrency === "USD" ? "$" : profile?.defaultCurrency === "GBP" ? "£" : profile?.defaultCurrency === "EUR" ? "€" : "₦"}{formData.deliveryInfo.cost.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-4 border-t border-surface-100">
                                    <span className="text-sm font-black text-surface-900 uppercase tracking-widest italic">Total Paid</span>
                                    <span className="text-2xl font-black text-primary-500 tracking-tighter">{profile?.defaultCurrency === "USD" ? "$" : profile?.defaultCurrency === "GBP" ? "£" : profile?.defaultCurrency === "EUR" ? "€" : "₦"}{total.toLocaleString()}</span>
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
                            <button
                                onClick={handleSaveDraft}
                                className="w-full bg-white border-2 border-surface-200 text-surface-600 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                Save as Draft
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
