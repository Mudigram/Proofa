"use client";

import React from "react";
import { Check } from "lucide-react";

export const PRESET_COLORS = [
    { id: "orange", label: "Burnt Orange", hex: "#e8590c" },
    { id: "blue", label: "Ocean Blue", hex: "#0ea5e9" },
    { id: "green", label: "Emerald Green", hex: "#10b981" },
    { id: "purple", label: "Royal Purple", hex: "#8b5cf6" },
    { id: "black", label: "Midnight", hex: "#0f172a" },
    { id: "red", label: "Crimson", hex: "#dc2626" },
];

interface ColorPickerProps {
    value: string;
    onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {PRESET_COLORS.map((color) => {
                const isSelected = value.toLowerCase() === color.hex.toLowerCase();
                return (
                    <button
                        key={color.id}
                        type="button"
                        onClick={() => onChange(color.hex)}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95 ${isSelected
                                ? "border-surface-900 dark:border-primary-500 bg-surface-50 dark:bg-surface-800 shadow-md"
                                : "border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-200 dark:hover:border-surface-700"
                            }`}
                    >
                        <div
                            className="w-8 h-8 rounded-full shadow-inner mb-2 flex items-center justify-center text-white"
                            style={{ backgroundColor: color.hex }}
                        >
                            {isSelected && <Check size={16} strokeWidth={3} />}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${isSelected ? "text-surface-900 dark:text-surface-50" : "text-surface-500 dark:text-surface-400"}`}>
                            {color.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
