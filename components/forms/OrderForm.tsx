"use client";

import React, { useState, useEffect } from "react";
import { Input, SegmentedControl, CurrencyInput, TextArea } from "@/components/ui/FormInput";
import { LogoUpload } from "@/components/ui/LogoUpload";
import LivePreview from "@/components/LivePreview";
import { OrderData, LineItem } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { getDocumentById } from "@/lib/StorageUtils";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";

export default function OrderForm() {
    const searchParams = useSearchParams();
    const docId = searchParams.get("id");

    const [formData, setFormData] = useState<OrderData>({
        customerName: "",
        items: [{ id: "1", name: "", quantity: 1, price: 0 }],
        totalAmount: 0,
        deliveryStatus: "Pending",
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
            if (doc && doc.type === "order") {
                const data = doc.data as OrderData;
                setFormData({
                    ...data,
                    bankDetails: data.bankDetails || { bankName: "", accountNumber: "", accountName: "", enabled: false },
                    deliveryInfo: data.deliveryInfo || { location: "", cost: 0, enabled: false },
                });
                setMode("preview");
            }
        }
    }, [docId]);

    const handleChange = (field: keyof OrderData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
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
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate total amount
        const subtotal = newItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const deliveryCost = formData.deliveryInfo?.enabled ? formData.deliveryInfo.cost : 0;

        setFormData(prev => ({
            ...prev,
            items: newItems,
            totalAmount: subtotal + deliveryCost
        }));
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
        const newItems = formData.items.filter((item) => item.id !== id);
        const subtotal = newItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const deliveryCost = formData.deliveryInfo?.enabled ? formData.deliveryInfo.cost : 0;

        setFormData((prev) => ({
            ...prev,
            items: newItems,
            totalAmount: subtotal + deliveryCost
        }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.customerName.trim()) newErrors.customerName = "Required";

        if (formData.bankDetails?.enabled) {
            if (!formData.bankDetails.bankName.trim()) newErrors.bankName = "Required";
            if (!formData.bankDetails.accountName.trim()) newErrors.accountName = "Required";
            if (formData.bankDetails.accountNumber.length !== 10) {
                newErrors.accountNumber = "10 digits";
            }
        }

        if (formData.deliveryInfo?.enabled) {
            if (!formData.deliveryInfo.location.trim()) newErrors.deliveryLocation = "Required";
        }

        let itemsValid = true;
        formData.items.forEach(item => {
            if (!item.name.trim()) itemsValid = false;
        });

        if (!itemsValid) newErrors.items = "Fill all names";
        if (formData.items.length === 0) newErrors.items = "Add item";

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
                        <div className="flex flex-col gap-10">
                            <StaggerItem>
                                <LogoUpload
                                    value={formData.logoUrl}
                                    onChange={(url) => handleChange("logoUrl", url)}
                                />
                            </StaggerItem>

                            <StaggerItem>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="CUSTOMER NAME"
                                        placeholder="Who is this order for?"
                                        value={formData.customerName}
                                        onChange={(e) => handleChange("customerName", e.target.value)}
                                        className="bg-white border-surface-200"
                                        error={errors.customerName}
                                    />
                                    <Input
                                        label="CUSTOMER PHONE (OPTIONAL)"
                                        placeholder="e.g. 07022334455"
                                        value={formData.customerPhone || ""}
                                        onChange={(e) => handleChange("customerPhone", e.target.value)}
                                        className="bg-white border-surface-200"
                                    />
                                </div>
                            </StaggerItem>

                            <StaggerItem>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Items</h3>
                                        <button
                                            onClick={addItem}
                                            className="text-primary-600 text-[10px] font-black uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full"
                                        >
                                            + Add Item
                                        </button>
                                    </div>

                                    {formData.items.map((item, index) => (
                                        <div key={item.id} className="relative bg-white border border-surface-100 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                                            {formData.items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-surface-100 rounded-full shadow-sm flex items-center justify-center text-red-500 z-10"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                            <Input
                                                label="ITEM NAME"
                                                placeholder="e.g. Designer Sneakers"
                                                value={item.name}
                                                onChange={(e) => updateItem(index, "name", e.target.value)}
                                                className="bg-surface-50 border-none"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="QTY"
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                                    className="bg-surface-50 border-none"
                                                />
                                                <CurrencyInput
                                                    label="PRICE"
                                                    value={item.price}
                                                    onChange={(val) => updateItem(index, "price", val)}
                                                    className="bg-surface-50 border-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {errors.items && <p className="text-red-500 text-[10px] font-bold mt-2 px-1">{errors.items}</p>}
                                </div>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500/10">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400">Payment details</h3>
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
                                                placeholder="e.g. Access Bank"
                                                value={formData.bankDetails.bankName}
                                                onChange={(e) => handleNestedChange("bankDetails", "bankName", e.target.value)}
                                                error={errors.bankName}
                                                className="bg-surface-50 border-none"
                                            />
                                            <Input
                                                label="ACCOUNT NAME"
                                                placeholder="e.g. Mudiaga Dev"
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

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500/10">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400">Delivery</h3>
                                        <button
                                            onClick={() => {
                                                const newEnabled = !formData.deliveryInfo?.enabled;
                                                handleNestedChange("deliveryInfo", "enabled", newEnabled);
                                                // Trigger total recalculation
                                                const subtotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
                                                const cost = newEnabled ? formData.deliveryInfo?.cost || 0 : 0;
                                                handleChange("totalAmount", subtotal + cost);
                                            }}
                                            className={`w-10 h-6 rounded-full transition-all relative ${formData.deliveryInfo?.enabled ? 'bg-primary-500' : 'bg-surface-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.deliveryInfo?.enabled ? 'left-5' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {formData.deliveryInfo?.enabled && (
                                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Input
                                                label="DELIVERY LOCATION"
                                                placeholder="e.g. Abuja, FCT"
                                                value={formData.deliveryInfo.location}
                                                onChange={(e) => handleNestedChange("deliveryInfo", "location", e.target.value)}
                                                error={errors.deliveryLocation}
                                                className="bg-surface-50 border-none"
                                            />
                                            <CurrencyInput
                                                label="DELIVERY COST"
                                                value={formData.deliveryInfo.cost}
                                                onChange={(val) => {
                                                    handleNestedChange("deliveryInfo", "cost", val);
                                                    const subtotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
                                                    handleChange("totalAmount", subtotal + val);
                                                }}
                                                className="bg-surface-50 border-none"
                                            />
                                        </div>
                                    )}
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <section className="flex flex-col gap-5 bg-white p-6 rounded-[2rem] border border-surface-100 shadow-sm">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-400 px-1">Order Notes / Terms</h3>
                                    <TextArea
                                        placeholder="e.g. Delivery takes 3-5 days"
                                        value={formData.terms || ""}
                                        onChange={(e: any) => handleChange("terms", e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                </section>
                            </StaggerItem>

                            <StaggerItem>
                                <SegmentedControl
                                    label="DELIVERY STATUS"
                                    options={["Pending", "Processing", "Delivered"]}
                                    value={formData.deliveryStatus}
                                    onChange={(val) => handleChange("deliveryStatus", val)}
                                />
                            </StaggerItem>
                        </div>
                    </StaggerContainer>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 transition-all duration-500">
                        <LivePreview
                            data={formData}
                            type="order"
                            initialTemplate={searchParams.get("template") as any || "minimalist"}
                        />
                    </div>
                )}

                <StaggerContainer delayChildren={0.5}>
                    <StaggerItem>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-lg mb-6 mx-2 -mt-4 relative z-10">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                    <span className="uppercase tracking-widest text-[10px] font-black opacity-50">Items Subtotal</span>
                                    <span className="font-bold text-surface-900">₦{(formData.totalAmount - (formData.deliveryInfo?.enabled ? formData.deliveryInfo.cost : 0)).toLocaleString()}</span>
                                </div>
                                {formData.deliveryInfo?.enabled && (
                                    <div className="flex justify-between items-center text-sm font-medium text-surface-500 tracking-tight">
                                        <span className="uppercase tracking-widest text-[10px] font-black opacity-50">Delivery</span>
                                        <span className="font-bold text-surface-900">₦{formData.deliveryInfo.cost.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-4 border-t border-surface-100">
                                    <span className="text-sm font-black text-surface-900 uppercase tracking-widest italic">Total amount</span>
                                    <span className="text-2xl font-black text-primary-500 tracking-tighter">₦{formData.totalAmount.toLocaleString()}</span>
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
                                Generate Order Summary
                            </button>
                            <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.15em] text-center">
                                ORDERS ARE SAVED TO YOUR RECORD
                            </p>
                        </div>
                    </StaggerItem>
                </StaggerContainer>
            </div>
        </PageTransition>
    );
}
