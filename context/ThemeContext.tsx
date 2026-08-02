"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const storedTheme = localStorage.getItem("proofa_theme") as Theme | null;
            if (storedTheme === "dark" || storedTheme === "light") {
                setThemeState(storedTheme);
                if (storedTheme === "dark") {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                setThemeState("dark");
                document.documentElement.classList.add("dark");
            }
        } catch (_) {}
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem("proofa_theme", newTheme);
        } catch (_) {}
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
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
