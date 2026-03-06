"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useProGate } from "@/hooks/useProGate";
import { Crown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./Toast";
import { BrandLogo } from "./BrandLogo";

interface LogoUploadProps {
    value?: string;
    onChange: (base64?: string) => void;
    label?: string;
}

export const LogoUpload = ({ value, onChange, label = "Business Logo" }: LogoUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isPro } = useProGate();
    const { profile } = useAuth();
    const { showToast } = useToast();
    const businessName = profile?.businessName || "Your Business";

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Restrict size to 2MB
        if (file.size > 2 * 1024 * 1024) {
            showToast("Logo must be less than 2MB", "error");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined);
    };

    return (
        <div className="flex flex-col gap-3">
            <div
                onClick={handleClick}
                className={`${value ? "bg-white border-primary-500 shadow-xl shadow-primary-500/5" : "bg-gradient-to-br from-primary-50/50 to-white border-primary-100 hover:border-primary-300"
                    } border-2 border-dashed rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer active:scale-[0.98] transition-all duration-300 group relative`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />

                {value ? (
                    <div className="relative group/image">
                        <BrandLogo
                            src={value}
                            businessName={businessName}
                            size={96}
                            className="bg-white p-2"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute -top-3 -right-3 bg-white border border-surface-200 text-red-500 p-2 rounded-full shadow-xl hover:bg-red-50 transition-all opacity-0 group-hover/image:opacity-100 scale-90 group-hover/image:scale-100"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center text-primary-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                            <line x1="18" y1="9" x2="18.01" y2="9" />
                        </svg>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <h4 className="font-black text-surface-900 text-base tracking-tight">{label}</h4>
                    <p className="text-[10px] text-surface-400 font-bold uppercase tracking-[0.2em] max-w-[180px] mx-auto leading-relaxed">
                        {value ? "Tap box to change logo" : "Upload your brand logo"}
                    </p>
                </div>
            </div>

            {/* Post-Upload Upsell for Free Users */}
            {!isPro && value && (
                <Link href="/pricing" className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-all">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Crown size={14} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-surface-900">Save logo for next time?</p>
                        <p className="text-[10px] font-medium text-surface-500 mt-0.5">Upgrade to Pro to auto-fetch your logo</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </Link>
            )}
        </div>
    );
};
