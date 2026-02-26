"use client";

import React from "react";
import Link from "next/link";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import MinimalistTemplate from "@/components/templates/Minimalist";
import BoldTemplate from "@/components/templates/Bold";
import ClassicTemplate from "@/components/templates/Classic";
import { ReceiptData } from "@/lib/types";

const MOCK_DATA: ReceiptData = {
    businessName: "Proofa Coffee Bar",
    customerName: "Alex Pierce",
    description: "2x Oat Milk Latte, 1x Butter Croissant",
    amount: 4500,
    status: "Paid",
    paymentMethod: "Card",
    date: new Date().toISOString(),
};

interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    component: React.ComponentType<any>;
}

const templates: TemplateInfo[] = [
    {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean, modern, and high-contrast",
        component: MinimalistTemplate,
    },
    {
        id: "bold",
        name: "Bold & Bright",
        description: "Energetic colors with modern shapes",
        component: BoldTemplate,
    },
    {
        id: "classic",
        name: "Classic Professional",
        description: "Timeless letterhead style with clean typography",
        component: ClassicTemplate,
    },
];

export default function TemplatesPage() {
    return (
        <PageTransition>
            <main className="app-container py-6 pb-24">
                <header className="mb-8 mt-2">
                    <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
                        Templates
                    </h1>
                    <p className="text-surface-500 text-sm mt-1.5 font-medium">
                        Choose a professional look for your documents
                    </p>
                </header>

                <StaggerContainer>
                    <div className="flex flex-col gap-8">
                        {templates.map((template) => (
                            <StaggerItem key={template.id}>
                                <div className="bg-white border border-surface-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden flex flex-col gap-6 group hover:shadow-xl hover:border-primary-100 transition-all duration-500">
                                    {/* Preview Container */}
                                    <div className="relative aspect-[1/1] sm:aspect-[4/3] bg-surface-50 rounded-[1.5rem] overflow-hidden flex items-center justify-center border border-surface-50">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />

                                        {/* Scaled Template Preview */}
                                        <div className="w-[500px] scale-[0.5] sm:scale-[0.8] transition-transform duration-500 group-hover:scale-[0.47] sm:group-hover:scale-[0.62] pointer-events-none">
                                            <template.component data={MOCK_DATA} type="receipt" />
                                        </div>

                                        {/* Overlay to catch hover */}
                                        <div className="absolute inset-0 z-10" />
                                    </div>

                                    {/* Template Info */}
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <h2 className="text-xl font-black text-surface-900 tracking-tight uppercase">
                                                {template.name}
                                            </h2>
                                            <p className="text-surface-400 text-xs font-bold uppercase tracking-widest mt-1">
                                                {template.description}
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <Link
                                                href={`/receipt?template=${template.id}`}
                                                className="flex-1 bg-primary-500 text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-primary-500/20"
                                            >
                                                Use Receipt
                                            </Link>
                                            <Link
                                                href={`/invoice?template=${template.id}`}
                                                className="flex-1 bg-secondary-900 text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg"
                                            >
                                                Use Invoice
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>
            </main>
        </PageTransition>
    );
}
