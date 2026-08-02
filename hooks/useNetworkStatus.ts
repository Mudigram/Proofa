"use client";

import { useState, useEffect } from "react";

/**
 * useNetworkStatus Hook
 * 
 * A lightweight hook that detects online/offline status.
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(() => {
        if (typeof window === "undefined") return true;
        return navigator.onLine;
    });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return { isOnline };
}
