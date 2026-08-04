"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "proofa_theme";

/**
 * Reads the theme the pre-paint script in app/layout.tsx already applied.
 * Server render has no DOM, so it falls back to "light" — matching the
 * script's own fallback, which keeps the first client render consistent.
 */
function getInitialTheme(): Theme {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    // The inline script sets the class before paint; this resyncs React state
    // on mount for the hydration pass, where useState ran against the server HTML.
    useEffect(() => {
        setThemeState(getInitialTheme());
    }, []);

    // Follow the OS only while the user has made no explicit choice.
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = (e: MediaQueryListEvent) => {
            try {
                if (localStorage.getItem(STORAGE_KEY)) return;
            } catch {
                return;
            }
            const next: Theme = e.matches ? "dark" : "light";
            setThemeState(next);
            document.documentElement.classList.toggle("dark", next === "dark");
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
        } catch {
            // Private mode / storage disabled — theme still applies for this session.
        }
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            theme: "light" as Theme,
            toggleTheme: () => {},
            setTheme: () => {},
        };
    }
    return context;
}
