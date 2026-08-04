"use client";

import React from "react";
import { ClipboardPaste } from "lucide-react";

export const PasteButton = ({ onPaste }: { onPaste: (text: string) => void }) => {
    return (
        <button
            type="button"
            onClick={async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text) onPaste(text);
                } catch (err) {
                    console.error("Failed to read clipboard text: ", err);
                }
            }}
            className="p-1.5 text-surface-400 dark:text-surface-500 hover:text-primary-500 bg-surface-50 dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 rounded-xl transition-all active:scale-95 border border-surface-200 dark:border-surface-700 hover:border-primary-100 dark:hover:border-primary-800"
            title="Paste"
        >
            <ClipboardPaste size={16} strokeWidth={2.5} />
        </button>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    onClear?: () => void;
}

export const Input = ({ label, error, icon, rightElement, onClear, className = "", ...props }: InputProps) => {
    const showClear = typeof props.value === "string" && props.value.length > 0 && !props.disabled && !!onClear;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-surface-700 dark:text-surface-300 tracking-tight px-1 uppercase tracking-widest text-[10px]">
                {label}
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 group-focus-within:text-primary-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl py-3.5 ${icon ? "pl-11" : "px-4"
                        } ${rightElement || showClear ? "pr-12" : "pr-4"} text-surface-900 dark:text-surface-50 placeholder:text-surface-400 dark:placeholder:text-surface-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/30 transition-all outline-none font-medium shadow-sm active:scale-[0.99] ${className}`}
                    {...props}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5">
                    {showClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="w-5 h-5 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-200 flex items-center justify-center transition-colors text-xs font-bold"
                            title="Clear field"
                        >
                            &times;
                        </button>
                    )}
                    {rightElement}
                </div>
            </div>
            {error && <p className="text-xs text-red-500 dark:text-red-400 font-bold px-1">{error}</p>}
        </div>
    );
};

interface SegmentedControlProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: any) => void;
}

export const SegmentedControl = ({ label, options, value, onChange }: SegmentedControlProps) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-surface-700 dark:text-surface-300 tracking-tight px-1 uppercase tracking-widest text-[10px]">
                {label}
            </label>
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-1 rounded-2xl flex gap-1 shadow-sm">
                {options.map((option) => {
                    const isActive = value === option;
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onChange(option)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${isActive
                                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                                    : "text-surface-400 dark:text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800"
                                }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

interface CurrencyInputProps extends Omit<InputProps, "onChange"> {
    value: number;
    onChange: (value: number) => void;
}

export const CurrencyInput = ({ label, value, onChange, ...props }: CurrencyInputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        onChange(Number(rawValue) / 100);
    };

    const formattedValue = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(value);

    return (
        <Input
            label={label}
            value={formattedValue}
            onChange={handleChange}
            inputMode="numeric"
            icon={
                <span className="font-bold text-sm tracking-tighter">₦</span>
            }
            {...(props as any)}
        />
    );
};

export const TextArea = ({ label, error, className = "", ...props }: any) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-surface-700 dark:text-surface-300 tracking-tight px-1 uppercase tracking-widest text-[10px]">
                {label}
            </label>
            <textarea
                className={`w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 text-surface-900 dark:text-surface-50 placeholder:text-surface-400 dark:placeholder:text-surface-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/30 transition-all outline-none font-medium shadow-sm min-h-[100px] resize-none active:scale-[0.99] ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-red-500 dark:text-red-400 font-bold px-1">{error}</p>}
        </div>
    );
};
