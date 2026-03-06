"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface BrandLogoProps {
    src?: string;
    businessName: string;
    className?: string;
    size?: number;
}

/**
 * A robust logo component that handles Supabase URLs,
 * fallback to initials, and error states.
 */
export const BrandLogo = ({ src, businessName, className = "", size = 48 }: BrandLogoProps) => {
    const [error, setError] = useState(false);
    const initials = businessName ? businessName.charAt(0).toUpperCase() : "B";

    // Reset error state if src changes
    useEffect(() => {
        setError(false);
    }, [src]);

    if (!src || error) {
        return (
            <div
                className={`flex items-center justify-center bg-surface-900 text-white font-black italic rounded-full overflow-hidden ${className}`}
                style={{ width: size, height: size, fontSize: size * 0.4 }}
            >
                {/* Fallback to initials if no logo or logo fails */}
                {initials}
            </div>
        );
    }

    return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-white p-1 rounded-xl ${className}`} style={{ width: size, height: size }}>
            <Image
                src={src}
                alt={businessName}
                width={size}
                height={size}
                unoptimized
                className="w-full h-full object-contain"
                onError={() => {
                    console.error("Logo fails to load:", src);
                    setError(true);
                }}
            />
        </div>
    );
};
