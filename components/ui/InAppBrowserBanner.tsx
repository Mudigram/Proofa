"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

export function InAppBrowserBanner() {
    const [isInApp, setIsInApp] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const dismissed = sessionStorage.getItem("proofa_inapp_banner_dismissed");
        if (dismissed === "1") {
            setIsDismissed(true);
            return;
        }

        const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
        const isInstagram = /instagram/i.test(ua);
        const isWhatsApp = /whatsapp/i.test(ua);
        const isFacebook = /fban|fbav/i.test(ua);
        const isTikTok = /tiktok|musical_ly/i.test(ua);
        const isTwitter = /twitter/i.test(ua);

        if (isInstagram || isWhatsApp || isFacebook || isTikTok || isTwitter) {
            setIsInApp(true);
        }
    }, []);

    if (!isInApp || isDismissed) return null;

    const handleDismiss = () => {
        setIsDismissed(true);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("proofa_inapp_banner_dismissed", "1");
        }
    };

    return (
        <aside
            aria-label="In-app browser recommendation"
            className="bg-amber-500 text-surface-950 px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 shadow-md z-50 sticky top-0"
        >
            <div className="flex items-center gap-2 min-w-0">
                <ExternalLink size={15} className="shrink-0 text-surface-950" />
                <p className="truncate">
                    Tap <span className="font-bold">⋮</span> or <span className="font-bold">Share</span> &rarr; <span className="font-bold">Open in Chrome/Safari</span> for offline support.
                </p>
            </div>
            <button
                onClick={handleDismiss}
                className="p-1 hover:bg-black/10 rounded-full shrink-0 transition-colors"
                aria-label="Dismiss banner"
            >
                <X size={14} />
            </button>
        </aside>
    );
}
