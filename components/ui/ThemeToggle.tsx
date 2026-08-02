"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`w-9 h-9 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-600 dark:text-amber-400 hover:text-surface-900 dark:hover:text-amber-300 active:scale-90 transition-all ${className}`}
        >
            <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
            >
                {theme === "dark" ? (
                    <Sun size={18} className="text-amber-400 fill-amber-400/20" />
                ) : (
                    <Moon size={18} className="text-surface-600" />
                )}
            </motion.div>
        </button>
    );
}
