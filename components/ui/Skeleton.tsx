"use client";

import React from "react";

interface SkeletonProps {
    className?: string;
    variant?: "rect" | "circle" | "text";
}

export function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  const baseClass = "animate-pulse bg-slate-200 dark:bg-slate-800";

  const variants = {
    rect: "rounded-md",
    circle: "rounded-full",
    text: "rounded-md h-4"
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  );
}
