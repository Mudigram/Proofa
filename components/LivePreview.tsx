"use client";

import React, { useState } from "react";
import { TemplateName, DocumentType } from "@/lib/types";
import MinimalistTemplate from "./templates/Minimalist";
import BoldTemplate from "./templates/Bold";
import ClassicTemplate from "./templates/Classic";

import { captureElementAsImage, downloadImage } from "@/lib/ExportUtils";
import { shareContent, shareOnWhatsApp, dataUrlToFile } from "@/lib/ShareUtils";
import { saveDocument } from "@/lib/StorageUtils";
import { useToast } from "@/components/ui/Toast";

interface LivePreviewProps {
    data: any;
    type: DocumentType;
    initialTemplate?: TemplateName;
}

export default function LivePreview({ data, type, initialTemplate = "minimalist" }: LivePreviewProps) {
    const [activeTemplate, setActiveTemplate] = useState<TemplateName>(initialTemplate);
    const [isExporting, setIsExporting] = useState(false);
    const { showToast } = useToast();

    const templates = [
        { id: "minimalist", label: "Minimal" },
        { id: "bold", label: "Bold" },
        { id: "classic", label: "Classic" },
    ];

    const renderTemplate = () => {
        switch (activeTemplate) {
            case "minimalist":
                return <MinimalistTemplate data={data} type={type} />;
            case "bold":
                return <BoldTemplate data={data} type={type} />;
            case "classic":
                return <ClassicTemplate data={data} type={type} />;
            default:
                return <MinimalistTemplate data={data} type={type} />;
        }
    };

    const handleDownload = async () => {
        setIsExporting(true);
        // Save to history automatically on export
        saveDocument(data, type, activeTemplate);

        const dataUrl = await captureElementAsImage("document-preview");
        if (dataUrl) {
            downloadImage(dataUrl, `Proofa-${type}-${Date.now()}.png`);
            showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} saved & downloaded!`, "success");
        }
        setIsExporting(false);
    };

    const handleShare = async () => {
        setIsExporting(true);
        // Save to history automatically on share
        saveDocument(data, type, activeTemplate);

        const dataUrl = await captureElementAsImage("document-preview");
        if (dataUrl) {
            const file = await dataUrlToFile(dataUrl, `Proofa-${type}.png`);
            if (file) {
                const shared = await shareContent({
                    title: `Proofa ${type}`,
                    text: `Here is your ${type} from Proofa.`,
                    files: [file],
                });

                // Fallback to WhatsApp if native share fails or isn't available
                if (!shared) {
                    shareOnWhatsApp(`Check out this ${type} I generated with Proofa!`);
                    showToast("Opening WhatsApp...", "info");
                } else {
                    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} shared!`, "success");
                }
            }
        }
        setIsExporting(false);
    };

    const handleWhatsApp = async () => {
        // For WhatsApp, we ideally want to send the image, 
        // but simple wa.me links only support text.
        // We'll encourage them to use the "Share" button for actual image sending,
        // or just send a celebratory link.
        shareOnWhatsApp(`I just generated a professional ${type} using Proofa! 🧾✨`);
        showToast("Opening WhatsApp...", "info");
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Template Toggler */}
            <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase text-surface-400 tracking-[0.2em] px-1">
                    Select Design Style
                </label>
                <div className="flex gap-2 p-1.5 bg-surface-100 rounded-2xl border border-surface-200 overflow-x-auto no-scrollbar">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTemplate(t.id as TemplateName)}
                            className={`flex-1 min-w-[100px] whitespace-nowrap py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTemplate === t.id
                                ? "bg-white text-primary-500 shadow-md shadow-black/5 ring-1 ring-black/5"
                                : "text-surface-400 hover:text-surface-600"
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Actual Preview Frame */}
            <div className="w-full bg-surface-100/50 rounded-[2.5rem] p-4 md:p-8 flex justify-center border border-surface-200/50 min-h-[500px]">
                <div className="w-full origin-top transform scale-[1.0] md:scale-100 transition-all duration-500 rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex justify-center items-start">
                    {renderTemplate()}
                </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={handleDownload}
                    disabled={isExporting}
                    className="flex flex-col items-center justify-center gap-2 bg-white border border-surface-200 p-5 rounded-[2rem] hover:bg-surface-50 active:scale-95 transition-all group disabled:opacity-50"
                >
                    <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center text-surface-500 group-hover:text-primary-500 group-hover:bg-primary-50 transition-colors">
                        {isExporting ? (
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">Save Image</span>
                </button>

                <button
                    onClick={handleShare}
                    disabled={isExporting}
                    className="flex flex-col items-center justify-center gap-2 bg-primary-500 p-5 rounded-[2rem] shadow-xl shadow-primary-500/20 hover:bg-primary-600 active:scale-95 transition-all text-white disabled:opacity-50"
                >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        {isExporting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Share Now</span>
                </button>

                <button
                    onClick={handleWhatsApp}
                    className="col-span-2 flex items-center justify-center gap-3 bg-[#25D366] text-white p-5 rounded-[2rem] shadow-xl shadow-[#25D366]/20 hover:bg-[#20bd5a] active:scale-95 transition-all"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.67.15-.198.301-.769.971-.941 1.171-.173.2-.347.225-.648.075-.301-.15-1.272-.469-2.422-1.496-.893-.797-1.496-1.782-1.671-2.083-.173-.301-.018-.464.133-.613.136-.134.301-.351.452-.527.151-.176.202-.301.302-.502.101-.2.051-.376-.026-.527-.076-.15-.67-1.615-.918-2.214-.242-.587-.487-.508-.67-.518-.172-.01-.37-.01-.568-.01-.198 0-.521.074-.794.301-.273.227-1.042.871-1.042 2.126 0 1.255.914 2.47 1.04 2.621.127.15 1.796 2.744 4.35 3.847.608.262 1.082.418 1.452.535.61.194 1.166.166 1.603.101.488-.072 1.49-.607 1.701-1.195.21-.588.21-1.091.147-1.195-.064-.104-.233-.151-.534-.301zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.439 5.167L2 22l4.981-1.309A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Send to WhatsApp</span>
                </button>
            </div>
        </div>
    );
}
