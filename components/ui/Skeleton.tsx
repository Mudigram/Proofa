"use client";

import React from "react";

interface SkeletonProps {
    className?: string;
    variant?: "rect" | "circle" | "text";
}

export function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
    const baseClasses = "animate-pulse bg-surface-200";

    const variantClasses = {
        rect: "rounded-xl",
        circle: "rounded-full",
        text: "rounded-md h-4 w-full",
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            aria-hidden="true"
        />
    );
}
