"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
    label?: string;
    value: string; // YYYY-MM-DD
    onChange: (dateStr: string) => void;
    className?: string;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const DatePicker: React.FC<DatePickerProps> = ({
    label = "DATE",
    value,
    onChange,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the current value into year, month (0-11), and day (1-31)
    const parsedDate = useMemo(() => {
        if (!value) {
            const now = new Date();
            return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
        }
        const parts = value.split("-");
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return { year: y, month: m, day: d };
            }
        }
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    }, [value]);

    // Calendar viewport state (the month/year currently being browsed)
    const [viewYear, setViewYear] = useState<number>(parsedDate.year);
    const [viewMonth, setViewMonth] = useState<number>(parsedDate.month);

    // Sync view when parsedDate changes externally
    useEffect(() => {
        setViewYear(parsedDate.year);
        setViewMonth(parsedDate.month);
    }, [parsedDate.year, parsedDate.month]);

    // Dismiss on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    // Formatted trigger display text
    const getFormattedDisplay = () => {
        if (!value) return "Select date";
        try {
            const { year, month, day } = parsedDate;
            const dateObj = new Date(year, month, day);

            const today = new Date();
            const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday =
                yesterday.getFullYear() === year &&
                yesterday.getMonth() === month &&
                yesterday.getDate() === day;

            if (isToday) return `Today (${day} ${SHORT_MONTH_NAMES[month]})`;
            if (isYesterday) return `Yesterday (${day} ${SHORT_MONTH_NAMES[month]})`;

            return `${DAY_NAMES[dateObj.getDay()]}, ${day} ${SHORT_MONTH_NAMES[month]} ${year}`;
        } catch {
            return value;
        }
    };

    // Quick Preset buttons handler
    const handlePreset = (preset: "today" | "yesterday" | "2daysAgo") => {
        const d = new Date();
        if (preset === "yesterday") {
            d.setDate(d.getDate() - 1);
        } else if (preset === "2daysAgo") {
            d.setDate(d.getDate() - 2);
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const newDateStr = `${year}-${month}-${day}`;

        onChange(newDateStr);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
        setIsOpen(false);
    };

    // Date Cell Select
    const handleSelectDay = (day: number) => {
        const monthStr = String(viewMonth + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        const dateStr = `${viewYear}-${monthStr}-${dayStr}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    // Month Navigation
    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((prev) => prev - 1);
        } else {
            setViewMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((prev) => prev + 1);
        } else {
            setViewMonth((prev) => prev + 1);
        }
    };

    // Calculate calendar days
    const calendarGrid = useMemo(() => {
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
        // Monday = 0, Tuesday = 1 ... Sunday = 6
        const startOffset = (firstDayOfWeek + 6) % 7;

        const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
        const prevPadded = [];
        for (let i = startOffset - 1; i >= 0; i--) {
            prevPadded.push({ day: prevMonthDays - i, isCurrentMonth: false, isPrev: true });
        }

        const currentMonthDays = [];
        for (let d = 1; d <= daysInMonth; d++) {
            currentMonthDays.push({ day: d, isCurrentMonth: true });
        }

        const totalRendered = prevPadded.length + currentMonthDays.length;
        const nextPaddedCount = totalRendered % 7 === 0 ? 0 : 7 - (totalRendered % 7);
        const nextPadded = [];
        for (let d = 1; d <= nextPaddedCount; d++) {
            nextPadded.push({ day: d, isCurrentMonth: false, isNext: true });
        }

        return [...prevPadded, ...currentMonthDays, ...nextPadded];
    }, [viewYear, viewMonth]);

    const todayDate = useMemo(() => new Date(), []);

    return (
        <div
            ref={containerRef}
            className={`flex flex-col gap-1.5 transition-all ${isOpen ? "relative z-50" : "relative z-10"} ${className}`}
        >
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 dark:text-surface-500 px-1">
                    {label}
                </label>
            )}

            <div className={`relative ${isOpen ? "z-50" : ""}`}>
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
                        className={`text-surface-400 dark:text-surface-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                    />
                </button>

                {/* Bespoke Interactive Proofa Calendar Popover (Zero Web JS Native Input Wonkiness) */}
                {isOpen && (
                    <>
                        {/* Invisible backdrop */}
                        <div
                            className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20 backdrop-blur-[1px]"
                            onClick={() => setIsOpen(false)}
                        />

                        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 select-none">
                            {/* 1. Instant Preset Pills */}
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handlePreset("today")}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-400 text-[11px] font-bold tracking-tight transition-colors text-center active:scale-95"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePreset("yesterday")}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 text-[11px] font-bold tracking-tight transition-colors text-center active:scale-95"
                                >
                                    Yesterday
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePreset("2daysAgo")}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 text-[11px] font-bold tracking-tight transition-colors text-center active:scale-95"
                                >
                                    2 Days Ago
                                </button>
                            </div>

                            <div className="h-px bg-surface-100 dark:bg-surface-800" />

                            {/* 2. Month & Year Stepper Header */}
                            <div className="flex items-center justify-between px-1">
                                <span className="font-mono text-xs font-black text-surface-900 dark:text-surface-50 uppercase tracking-tight">
                                    {MONTH_NAMES[viewMonth]} {viewYear}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={handlePrevMonth}
                                        className="w-7 h-7 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 flex items-center justify-center transition-colors active:scale-90"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextMonth}
                                        className="w-7 h-7 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 flex items-center justify-center transition-colors active:scale-90"
                                        aria-label="Next month"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* 3. Weekday Labels */}
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {WEEKDAY_HEADERS.map((w, idx) => (
                                    <span
                                        key={idx}
                                        className="font-mono text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider py-0.5"
                                    >
                                        {w}
                                    </span>
                                ))}
                            </div>

                            {/* 4. Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarGrid.map((item, index) => {
                                    if (!item.isCurrentMonth) {
                                        return (
                                            <div
                                                key={index}
                                                className="h-8 flex items-center justify-center font-mono text-xs text-surface-300 dark:text-surface-700 pointer-events-none select-none"
                                            >
                                                {item.day}
                                            </div>
                                        );
                                    }

                                    const isSelected =
                                        parsedDate.year === viewYear &&
                                        parsedDate.month === viewMonth &&
                                        parsedDate.day === item.day;

                                    const isToday =
                                        todayDate.getFullYear() === viewYear &&
                                        todayDate.getMonth() === viewMonth &&
                                        todayDate.getDate() === item.day;

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelectDay(item.day)}
                                            className={`h-8 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center relative tabular-nums active:scale-90 ${
                                                isSelected
                                                    ? "bg-[#e8590c] text-white shadow-md shadow-[#e8590c]/25 font-black"
                                                    : isToday
                                                    ? "bg-primary-50 dark:bg-primary-950/60 text-[#e8590c] dark:text-[#f97316] font-black border border-primary-200 dark:border-primary-800/80"
                                                    : "text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
                                            }`}
                                        >
                                            {item.day}
                                            {isToday && !isSelected && (
                                                <span className="w-1 h-1 rounded-full bg-[#e8590c] absolute bottom-1" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
