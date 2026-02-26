"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TemplateName, DocumentType } from "@/lib/types";
import MinimalistTemplate from "./templates/Minimalist";
import BoldTemplate from "./templates/Bold";
import ClassicTemplate from "./templates/Classic";

import { captureElementAsImage, downloadImage, downloadAsPDF } from "@/lib/ExportUtils";
import { shareToWhatsApp, shareViaWebShare, prebakeShareFile, canShareFiles } from "@/lib/ShareUtils";
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

    // "idle" | "baking" | "ready" | "failed"
    const [prebakeState, setPrebakeState] = useState<"idle" | "baking" | "ready" | "failed">("idle");

    const { showToast } = useToast();

    const prebakedFile = useRef<File | null>(null);
    const dataUrlCache = useRef<string | null>(null);
    const prebakeAbort = useRef<AbortController | null>(null);

    const CAPTURE_ID = "document-preview";

    const templates = [
        { id: "minimalist", label: "Minimal", premium: false },
        { id: "bold", label: "Bold", premium: false },
        { id: "classic", label: "Classic", premium: false },
    ];

    const currentTemplateConfig = templates.find(t => t.id === activeTemplate);
    const isLocked = currentTemplateConfig?.premium && !isPremium;

    const renderTemplate = () => {
        const props = { data, type };
        switch (activeTemplate) {
            case "minimalist": return <MinimalistTemplate {...props} />;
            case "bold": return <BoldTemplate {...props} />;
            case "classic": return <ClassicTemplate {...props} />;
            default: return <MinimalistTemplate {...props} />;
        }
    };

    // ── Pre-bake ───────────────────────────────────────────────────────────────
    // Runs 600ms after data/template change settles.
    // Produces a ready-to-share File before the user ever taps anything.
    // This is what makes iOS file sharing work — zero async work at tap time.
    const runPrebake = useCallback(async (signal: AbortSignal) => {
        setPrebakeState("baking");
        prebakedFile.current = null;
        dataUrlCache.current = null;

        // Short settle delay so the hidden clone has laid out
        await new Promise(r => setTimeout(r, 600));
        if (signal.aborted) return;

        try {
            const dataUrl = await captureElementAsImage(CAPTURE_ID);
            if (signal.aborted || !dataUrl) {
                setPrebakeState("failed");
                return;
            }

            dataUrlCache.current = dataUrl;

            const filename = `Proofa-${type}.png`;
            const file = await prebakeShareFile(dataUrl, filename);
            if (signal.aborted) return;

            prebakedFile.current = file;
            setPrebakeState(file ? "ready" : "failed");

            console.log("[Prebake] ✅ Share file ready:", !!file, "canShareFiles:", file ? canShareFiles([file]) : false);
        } catch (e) {
            if (!signal.aborted) {
                console.warn("[Prebake] Failed:", e);
                setPrebakeState("failed");
            }
        }
    }, [data, type, activeTemplate]);

    useEffect(() => {
        // Cancel any in-progress bake and start fresh
        prebakeAbort.current?.abort();
        const ctrl = new AbortController();
        prebakeAbort.current = ctrl;

        // Small leading delay so we don't fire on every keystroke
        const t = setTimeout(() => runPrebake(ctrl.signal), 300);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
    }, [runPrebake]);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const blockIfLocked = () => {
        if (isLocked) {
            showToast("Classic Template is a Premium feature! 💎", "info");
            return true;
        }
        return false;
    };

    /** Returns cached dataUrl or captures fresh. For download paths only. */
    const getFreshDataUrl = async (): Promise<string | null> => {
        if (dataUrlCache.current) return dataUrlCache.current;
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 80));
        const url = await captureElementAsImage(CAPTURE_ID);
        if (url) dataUrlCache.current = url;
        return url;
    };

    // ── Share handlers ─────────────────────────────────────────────────────────

    const handleWhatsApp = async () => {
        if (blockIfLocked()) return;
        setIsExporting(true);
        saveDocument(data, type, activeTemplate);

        // If bake is still running, wait for it briefly (Android is fine with this;
        // iOS ideally has prebakeState === "ready" before user taps)
        if (prebakeState === "baking") {
            showToast("Almost ready... ⏳", "info");
            await new Promise(r => setTimeout(r, 1200));
        }

        // Ensure we have a dataUrl one way or another
        const dataUrl = dataUrlCache.current ?? await getFreshDataUrl();
        if (!dataUrl) {
            showToast("Couldn't prepare the document. Try again.", "error");
            setIsExporting(false);
            return;
        }

        const filename = `Proofa-${type}-${Date.now()}.png`;

        // ↓ navigator.share() called as close to here as possible
        const result = await shareToWhatsApp({
            dataUrl,
            filename,
            docType: type,
            prebaked: prebakedFile.current,  // null-safe inside shareToWhatsApp
        });

        if (result === "shared") showToast("Sent to WhatsApp! 🟢", "success");
        else if (result === "downloaded") showToast("Image saved 📥 — open WhatsApp → tap 📎 → attach it", "info");
        else if (result === "aborted") { /* user cancelled, say nothing */ }
        else showToast("Something went wrong. Use the Image button instead.", "error");

        setIsExporting(false);
    };

    const handleShare = async () => {
        if (blockIfLocked()) return;
        setIsExporting(true);
        saveDocument(data, type, activeTemplate);

        const dataUrl = dataUrlCache.current ?? await getFreshDataUrl();
        if (!dataUrl) {
            showToast("Couldn't capture document.", "error");
            setIsExporting(false);
            return;
        }

        const filename = `Proofa-${type}-${Date.now()}.png`;
        const result = await shareViaWebShare({
            dataUrl,
            filename,
            docType: type,
            prebaked: prebakedFile.current,
        });

        if (result === "shared") showToast("Shared!", "success");
        else if (result === "downloaded") showToast("Image saved — attach it manually 📎", "info");
        else if (result === "aborted") { /* silent */ }
        else showToast("Share failed. Try the Image button.", "error");

        setIsExporting(false);
    };

    const handleDownloadPDF = async () => {
        if (blockIfLocked()) return;
        setIsExporting(true);
        saveDocument(data, type, activeTemplate);
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 80));
        const ok = await downloadAsPDF(CAPTURE_ID, `Proofa-${type}-${Date.now()}.pdf`);
        showToast(ok ? "Saved as PDF! 📄" : "PDF generation failed.", ok ? "success" : "error");
        setIsExporting(false);
    };

    const handleDownload = async () => {
        if (blockIfLocked()) return;
        setIsExporting(true);
        saveDocument(data, type, activeTemplate);
        const dataUrl = await getFreshDataUrl();
        if (dataUrl) {
            downloadImage(dataUrl, `Proofa-${type}-${Date.now()}.png`);
            showToast("Image saved! 🖼️", "success");
        } else {
            showToast("Failed to save image.", "error");
        }
        setIsExporting(false);
    };

    // ── Derived UI state ───────────────────────────────────────────────────────

    const waReady = prebakeState === "ready";
    const waBaking = prebakeState === "baking" || prebakeState === "idle";

    // WhatsApp button label shifts based on state
    const waLabel = waBaking ? "Preparing..." : "Share to WhatsApp";

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-8 w-full">

            {/* Hidden clean capture target */}
            <div
                aria-hidden="true"
                className="fixed pointer-events-none overflow-visible"
                style={{ left: "-9999px", top: 0, transform: "none", zIndex: -1 }}
            >
                {renderTemplate()}
            </div>

            {/* Template selector */}
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

            {/* Visual preview */}
            <div className="w-full bg-surface-100/50 rounded-[2.5rem] p-4 md:p-8 flex justify-center border border-surface-200/50 min-h-[400px] relative">
                <div className={`w-full max-w-[480px] mx-auto origin-top transform scale-[0.95] md:scale-100 transition-all duration-500 rounded-2xl ${activeTemplate === "classic" ? "overflow-visible" : "overflow-hidden"} shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex justify-center items-start ${isLocked ? "blur-md pointer-events-none grayscale" : ""}`}>
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

            {/* Action bar */}
            <div className="flex flex-col gap-3 px-2">

                {/* WhatsApp CTA */}
                <button
                    onClick={handleWhatsApp}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 px-6 rounded-2xl shadow-lg shadow-[#25D366]/20 active:scale-[0.98] transition-all disabled:opacity-60 relative overflow-hidden"
                >
                    {/* Pulse shimmer while baking */}
                    {waBaking && (
                        <span className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl" />
                    )}

                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 relative z-10">
                        <path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.67.15-.198.301-.769.971-.941 1.171-.173.2-.347.225-.648.075-.301-.15-1.272-.469-2.422-1.496-.893-.797-1.496-1.782-1.671-2.083-.173-.301-.018-.464.133-.613.136-.134.301-.351.452-.527.151-.176.202-.301.302-.502.101-.2.051-.376-.026-.527-.076-.15-.67-1.615-.918-2.214-.242-.587-.487-.508-.67-.518-.172-.01-.37-.01-.568-.01-.198 0-.521.074-.794.301-.273.227-1.042.871-1.042 2.126 0 1.255.914 2.47 1.04 2.621.127.15 1.796 2.744 4.35 3.847.608.262 1.082.418 1.452.535.61.194 1.166.166 1.603.101.488-.072 1.49-.607 1.701-1.195.21-.588.21-1.091.147-1.195-.064-.104-.233-.151-.534-.301zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.439 5.167L2 22l4.981-1.309A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>

                    <span className="text-xs font-black uppercase tracking-widest relative z-10">
                        {waLabel}
                    </span>

                    {/* Ready indicator */}
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-all duration-500 z-10 ${waReady ? "bg-white scale-100 shadow-[0_0_6px_2px_rgba(255,255,255,0.4)]" :
                            waBaking ? "bg-white/30 scale-75 animate-pulse" :
                                "bg-red-300 scale-75"   // failed state
                        }`} />
                </button>

                {/* Hint — only on desktop where file sharing isn't supported */}
                {typeof navigator !== "undefined" && !navigator.share && (
                    <p className="text-center text-[10px] text-surface-400 font-medium px-4 -mt-1">
                        💡 Open on mobile to share directly to WhatsApp
                    </p>
                )}

                {/* Secondary actions */}
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