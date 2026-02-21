"use client";

import React, { useRef } from "react";
import Image from "next/image";


interface LogoUploadProps {
    value?: string;
    onChange: (base64?: string) => void;
    label?: string;
}

export const LogoUpload = ({ value, onChange, label = "Business Logo" }: LogoUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
        <div
            onClick={() => fileInputRef.current?.click()}
            className={`${value ? "bg-white border-primary-500 shadow-xl shadow-primary-500/5" : "bg-gradient-to-br from-primary-50/50 to-white border-primary-100 hover:border-primary-300"
                } border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-5 text-center cursor-pointer active:scale-[0.98] transition-all duration-300 group`}
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
                    <Image
                        src={value}
                        alt="Logo Preview"
                        width={96}
                        height={96}
                        unoptimized
                        className="w-24 h-24 object-contain rounded-2xl shadow-md bg-white p-2"
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
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center text-primary-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                        <line x1="18" y1="9" x2="18.01" y2="9" />
                    </svg>
                </div>
            )}

            <div className="flex flex-col gap-1">
                <h4 className="font-black text-surface-900 text-lg tracking-tight">{label}</h4>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-[0.2em] max-w-[180px] mx-auto leading-relaxed">
                    {value ? "Tap box to change logo" : "Professionalize your docs with your brand logo"}
                </p>
            </div>
            {!value && (
                <div className="mt-2 bg-white border border-primary-100 px-6 py-2.5 rounded-2xl text-[10px] font-black text-primary-600 uppercase tracking-widest shadow-sm group-hover:shadow-md transition-all">
                    Choose Image
                </div>
            )}
        </div>
    );
};
