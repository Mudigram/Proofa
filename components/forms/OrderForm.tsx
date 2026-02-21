"use client";

import React, { useState, useEffect } from "react";
import { Input, SegmentedControl, CurrencyInput } from "@/components/ui/FormInput";
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
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mode, setMode] = useState<"edit" | "preview">("edit");

    useEffect(() => {
        if (docId) {
            const doc = getDocumentById(docId);
            if (doc && doc.type === "order") {
                setFormData(doc.data as OrderData);
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

    const updateItem = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate total amount
        const newTotal = newItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

        setFormData(prev => ({
            ...prev,
            items: newItems,
            totalAmount: newTotal
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
        const newTotal = newItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

        setFormData((prev) => ({
            ...prev,
            items: newItems,
            totalAmount: newTotal
        }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.customerName.trim()) newErrors.customerName = "Required";

        let itemsValid = true;
        formData.items.forEach(item => {
            if (!item.name.trim()) itemsValid = false;
        });

        if (!itemsValid) newErrors.items = "Fill all item names";
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
                        <div className="flex flex-col gap-10">
                            <StaggerItem>
                                <LogoUpload
                                    value={formData.logoUrl}
                                    onChange={(url) => handleChange("logoUrl", url)}
                                />
                            </StaggerItem>

                            <StaggerItem>
                                <Input
                                    label="CUSTOMER NAME"
                                    placeholder="Who is this order for?"
                                    value={formData.customerName}
                                    onChange={(e) => handleChange("customerName", e.target.value)}
                                    className="bg-white border-surface-200"
                                    error={errors.customerName}
                                />
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
