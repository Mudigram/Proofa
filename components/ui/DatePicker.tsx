"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface DatePickerProps {
    label?: string;
    value: string; // YYYY-MM-DD
    onChange: (dateStr: string) => void;
    className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    label = "DATE",
    value,
    onChange,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const getFormattedDisplay = () => {
        if (!value) return "Select date";
        try {
            const parts = value.split("-");
            if (parts.length !== 3) return value;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);

            if (!y || !m || !d) return value;
            const dateObj = new Date(y, m - 1, d);

            const today = new Date();
            const isToday =
                today.getFullYear() === y &&
                today.getMonth() === m - 1 &&
                today.getDate() === d;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday =
                yesterday.getFullYear() === y &&
                yesterday.getMonth() === m - 1 &&
                yesterday.getDate() === d;

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            if (isToday) return `Today (${d} ${monthNames[m - 1]})`;
            if (isYesterday) return `Yesterday (${d} ${monthNames[m - 1]})`;

            return `${dayNames[dateObj.getDay()]}, ${d} ${monthNames[m - 1]} ${y}`;
        } catch {
            return value;
        }
    };

    const handlePreset = (preset: "today" | "yesterday") => {
        const d = new Date();
        if (preset === "yesterday") {
            d.setDate(d.getDate() - 1);
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        onChange(`${year}-${month}-${day}`);
        setIsOpen(false);
    };

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 dark:text-surface-500 px-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Styled Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800/80 hover:border-primary-400 rounded-xl px-4 py-3 flex items-center justify-between text-left transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                            <Calendar size={15} aria-hidden="true" />
                        </div>
                        <span className="text-xs font-bold text-surface-900 dark:text-surface-50">
                            {getFormattedDisplay()}
                        </span>
                    </div>
                    <ChevronDown
                        size={15}
                        className={`text-surface-400 dark:text-surface-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                    />
                </button>

                {/* Brand-Styled Dropdown Popover */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-3 shadow-xl flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
                        {/* Preset Pills */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handlePreset("today")}
                                className="flex-1 py-2 px-3 rounded-xl bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePreset("yesterday")}
                                className="flex-1 py-2 px-3 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                            >
                                Yesterday
                            </button>
                        </div>

                        <div className="h-px bg-surface-100 dark:bg-surface-800 my-1" />

                        {/* Native Date Input Styled Container */}
                        <div className="flex flex-col gap-1 px-1">
                            <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Custom Date</span>
                            <input
                                type="date"
                                value={value}
                                onChange={(e) => {
                                    onChange(e.target.value);
                                    setIsOpen(false);
                                }}
                                className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs font-bold text-surface-900 dark:text-surface-50 outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
