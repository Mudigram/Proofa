"use client";

import React, { useState } from "react";
import { TemplateName, DocumentType } from "@/lib/types";
import MinimalistTemplate from "./templates/Minimalist";
import BoldTemplate from "./templates/Bold";
import ClassicTemplate from "./templates/Classic";

import { captureElementAsImage, downloadImage, downloadAsPDF } from "@/lib/ExportUtils";
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
    const [isPremium, setIsPremium] = useState(false);
    const { showToast } = useToast();

    const templates = [
        { id: "minimalist", label: "Minimal", premium: false },
        { id: "bold", label: "Bold", premium: false },
        { id: "classic", label: "Classic", premium: false },
    ];

    const currentTemplateConfig = templates.find(t => t.id === activeTemplate);
    const isLocked = currentTemplateConfig?.premium && !isPremium;

    const renderTemplate = (forCapture = false) => {
        // When rendering for capture, pass an id override so html2canvas
        // always targets the clean hidden copy, not the scaled visual one.
        const props = { data, type };
        switch (activeTemplate) {
            case "minimalist": return <MinimalistTemplate {...props} />;
            case "bold": return <BoldTemplate {...props} />;
            case "classic": return <ClassicTemplate {...props} />;
            default: return <MinimalistTemplate {...props} />;
        }
    };

    const blockIfLocked = () => {
        if (isLocked) {
            showToast("Classic Template is a Premium feature! 💎", "info");
            return true;
        }
        return false;
    };

    // ✅ Always capture from the hidden clean node, never the scaled visual one
    const CAPTURE_ID = "document-preview";

    const handleDownloadPDF = async () => {
        if (blockIfLocked()) return;
        setIsExporting(true);
        saveDocument(data, type, activeTemplate);

        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 100));

        const success = await downloadAsPDF(CAPTURE_ID, `Proofa-${type}-${Date.now()}.pdf`);
        showToast(success ? `${type.charAt(0).toUpperCase() + type.slice(1)} saved as PDF!` : "PDF generation failed.", success ? "success" : "error");
        setIsExporting(false);
    };

    const handleDownload = async () => {
        if (blockIfLocked()) return;
        setIsExporting(true);
        saveDocument(data, type, activeTemplate);

        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 100));

        const element = document.getElementById(CAPTURE_ID);
        if (element?.scrollHeight && element.scrollHeight > 1800) {
            showToast("Document is very long, export might take a moment.", "info");
        }

        const dataUrl = await captureElementAsImage(CAPTURE_ID);
        if (dataUrl) {
            downloadImage(dataUrl, `Proofa-${type}-${Date.now()}.png`);
            showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} saved as PNG!`, "success");
        }
        setIsExporting(false);
    };

    const handleShare = async () => {
        if (blockIfLocked()) return;
        setIsExporting(true);
        saveDocument(data, type, activeTemplate);

        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 100));

        const dataUrl = await captureElementAsImage(CAPTURE_ID);
        if (dataUrl) {
            const file = await dataUrlToFile(dataUrl, `Proofa-${type}.png`);
            if (file) {
                const canShare = navigator.canShare && navigator.canShare({ files: [file] });
                if (canShare) {
                    try {
                        await navigator.share({
                            title: `Proofa ${type}`,
                            text: `Here is your ${type} from Proofa.`,
                            files: [file],
                        });
                        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} shared!`, "success");
                    } catch (error) {
                        if ((error as any).name !== "AbortError") {
                            shareOnWhatsApp(`I just generated a professional ${type} using Proofa! 🧾✨\n\nDownload Proofa on the Play Store or use proofa.app`);
                            showToast("Opening WhatsApp...", "info");
                        }
                    }
                } else {
                    shareOnWhatsApp(`I just generated a professional ${type} using Proofa! 🧾✨\n\nI'll download the image for you now so you can attach it manually.`);
                    downloadImage(dataUrl, `Proofa-${type}-${Date.now()}.png`);
                    showToast("Downloaded image for manual sharing", "info");
                }
            }
        }
        setIsExporting(false);
    };

    const handleWhatsApp = async () => {
        if (blockIfLocked()) return;
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 100));

        const dataUrl = await captureElementAsImage(CAPTURE_ID);
        if (dataUrl) {
            shareOnWhatsApp(`I just generated a professional ${type} using Proofa! 🧾✨\n\nI've downloaded the document for you to share.`);
            downloadImage(dataUrl, `Proofa-${type}-${Date.now()}.png`);
            showToast("Opening WhatsApp & Downloading...", "info");
        } else {
            shareOnWhatsApp(`I just generated a professional ${type} using Proofa! 🧾✨`);
            showToast("Opening WhatsApp...", "info");
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full">

            {/*
             * ✅ HIDDEN CLEAN CAPTURE TARGET
             * Rendered at natural size with no transforms, scaling, blur, or clipping.
             * html2canvas always captures from this node via id="document-preview".
             * `aria-hidden` and pointer-events-none keep it invisible to users.
             */}
            <div
                aria-hidden="true"
                className="fixed -left-[9999px] top-0 pointer-events-none overflow-visible z-[-1]"
                style={{ transform: "none", scale: "unset" }}
            >
                {renderTemplate(true)}
            </div>

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
                            className={`flex-1 min-w-[100px] whitespace-nowrap py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTemplate === t.id
                                ? "bg-white text-primary-500 shadow-md shadow-black/5 ring-1 ring-black/5"
                                : "text-surface-400 hover:text-surface-600"
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-1.5">
                                {t.label}
                                {t.premium && !isPremium && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                    </svg>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Visual Preview Frame (display only — never captured) */}
            <div className="w-full bg-surface-100/50 rounded-[2.5rem] p-4 md:p-8 flex justify-center border border-surface-200/50 min-h-[400px] relative">
                {/*
                 * ✅ Visual wrapper: keep your scale/blur/grayscale effects here.
                 * We removed id="document-preview" from this node — capture always
                 * uses the clean hidden copy above.
                 */}
                <div className={`w-full max-w-[480px] mx-auto origin-top transform scale-[0.95] md:scale-100 transition-all duration-500 rounded-2xl ${activeTemplate === 'classic' ? 'overflow-visible' : 'overflow-hidden'} shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex justify-center items-start ${isLocked ? 'blur-md pointer-events-none grayscale' : ''}`}>
                    {renderTemplate()}
                </div>

                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 p-8">
                        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl flex flex-col items-center text-center gap-6 max-w-[280px] animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-black uppercase tracking-tight text-surface-900">Premium Style</h3>
                                <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest leading-relaxed">
                                    Unlock the Classic Design and generate unlimited professional receipts.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsPremium(true)}
                                className="w-full py-4 bg-surface-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all"
                            >
                                Upgrade to Premium
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col gap-3 px-2">
                <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 px-6 rounded-2xl shadow-lg shadow-[#25D366]/20 active:scale-[0.98] transition-all"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.67.15-.198.301-.769.971-.941 1.171-.173.2-.347.225-.648.075-.301-.15-1.272-.469-2.422-1.496-.893-.797-1.496-1.782-1.671-2.083-.173-.301-.018-.464.133-.613.136-.134.301-.351.452-.527.151-.176.202-.301.302-.502.101-.2.051-.376-.026-.527-.076-.15-.67-1.615-.918-2.214-.242-.587-.487-.508-.67-.518-.172-.01-.37-.01-.568-.01-.198 0-.521.074-.794.301-.273.227-1.042.871-1.042 2.126 0 1.255.914 2.47 1.04 2.621.127.15 1.796 2.744 4.35 3.847.608.262 1.082.418 1.452.535.61.194 1.166.166 1.603.101.488-.072 1.49-.607 1.701-1.195.21-.588.21-1.091.147-1.195-.064-.104-.233-.151-.534-.301zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.439 5.167L2 22l4.981-1.309A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-widest">Send to WhatsApp</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleShare}
                        disabled={isExporting}
                        className="flex flex-col items-center justify-center gap-1.5 bg-primary-500 text-white py-3 rounded-xl shadow-md active:scale-95 disabled:opacity-50"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        <span className="text-[8px] font-black uppercase">Share</span>
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isExporting}
                        className="flex flex-col items-center justify-center gap-1.5 bg-white border border-surface-200 py-3 rounded-xl active:scale-95 disabled:opacity-50"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="text-[8px] font-black uppercase text-surface-400">PDF</span>
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isExporting}
                        className="flex flex-col items-center justify-center gap-1.5 bg-white border border-surface-200 py-3 rounded-xl active:scale-95 disabled:opacity-50"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="text-[8px] font-black uppercase text-surface-400">Image</span>
                    </button>
                </div>
            </div>
        </div>
    );
}