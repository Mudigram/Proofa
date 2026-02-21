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
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mode, setMode] = useState<"edit" | "preview">("edit");

    const subtotal = useMemo(() => {
        return formData.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    }, [formData.items]);

    const tax = useMemo(() => subtotal * 0.075, [subtotal]);
    const total = useMemo(() => subtotal + tax, [subtotal, tax]);

    useEffect(() => {
        if (docId) {
            const doc = getDocumentById(docId);
            if (doc && doc.type === "invoice") {
                setFormData(doc.data as InvoiceData);
                setMode("preview");
            }
        }
    }, [docId]);

    const handleChange = (field: keyof InvoiceData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

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

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.businessName.trim()) newErrors.businessName = "Required";
        if (!formData.clientName.trim()) newErrors.clientName = "Required";

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
                                    <Input
                                        label="CLIENT NAME"
                                        placeholder="Who are you billing?"
                                        value={formData.clientName}
                                        onChange={(e) => handleChange("clientName", e.target.value)}
                                        error={errors.clientName}
                                    />
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
                                <div className="bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-sm font-medium text-surface-500">
                                            <span>Subtotal</span>
                                            <span className="font-bold text-surface-900">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium text-surface-500">
                                            <span>Tax (7.5% VAT)</span>
                                            <span className="font-bold text-surface-900">{formatCurrency(tax)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-surface-100">
                                            <span className="text-lg font-black text-surface-900 uppercase tracking-tight">Total Amount</span>
                                            <span className="text-2xl font-black text-primary-500">{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </StaggerItem>

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
