"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, className = "", ...props }: InputProps) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-surface-700 tracking-tight px-1 uppercase tracking-widest text-[10px]">
                {label}
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full bg-white border border-surface-200 rounded-2xl py-3.5 ${icon ? "pl-11" : "px-4"
                        } pr-4 text-surface-900 placeholder:text-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium shadow-sm active:scale-[0.99] ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 font-bold px-1">{error}</p>}
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
            <label className="text-sm font-bold text-surface-700 tracking-tight px-1 uppercase tracking-widest text-[10px]">
                {label}
            </label>
            <div className="bg-white border border-surface-200 p-1 rounded-2xl flex gap-1 shadow-sm">
                {options.map((option) => {
                    const isActive = value === option;
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onChange(option)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${isActive
                                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                                    : "text-surface-400 hover:text-surface-600 hover:bg-surface-50"
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
            <label className="text-sm font-bold text-surface-700 tracking-tight px-1 uppercase tracking-widest text-[10px]">
                {label}
            </label>
            <textarea
                className={`w-full bg-white border border-surface-200 rounded-2xl p-4 text-surface-900 placeholder:text-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium shadow-sm min-h-[100px] resize-none active:scale-[0.99] ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-red-500 font-bold px-1">{error}</p>}
        </div>
    );
};
