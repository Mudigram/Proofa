"use client";

import { useState, useEffect, useRef } from "react";

/**
 * usePullToRefresh Hook
 * 
 * A touch-gesture hook for pull-to-refresh.
 */
export function usePullToRefresh(onRefresh: () => void | Promise<void>) {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const pullDistanceRef = useRef(0);
    const isRefreshingRef = useRef(false);
    const onRefreshRef = useRef(onRefresh);

    useEffect(() => {
        isRefreshingRef.current = isRefreshing;
    }, [isRefreshing]);

    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let startY = 0;
        let isDragging = false;
        const PULL_THRESHOLD = 60;
        const MAX_PULL = 120;
        const MIN_REFRESH_TIME = 600;

        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isDragging = true;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || isRefreshingRef.current) return;

            const currentY = e.touches[0].clientY;
            const distance = currentY - startY;

            if (distance > 0 && window.scrollY === 0) {
                setIsPulling(true);
                const cappedDistance = Math.min(distance, MAX_PULL);
                setPullDistance(cappedDistance);
                pullDistanceRef.current = cappedDistance;
            }
        };

        const handleTouchEnd = async () => {
            if (!isDragging) return;
            isDragging = false;
            setIsPulling(false);

            if (pullDistanceRef.current > PULL_THRESHOLD && !isRefreshingRef.current) {
                setIsRefreshing(true);
                
                const startTime = Date.now();
                try {
                    await onRefreshRef.current();
                } catch (error) {
                    console.error("[usePullToRefresh] Error during refresh:", error);
                }
                
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < MIN_REFRESH_TIME) {
                    await new Promise(resolve => setTimeout(resolve, MIN_REFRESH_TIME - elapsedTime));
                }
                
                setIsRefreshing(false);
            }
            
            setPullDistance(0);
            pullDistanceRef.current = 0;
        };

        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchmove", handleTouchMove, { passive: true });
        document.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    return { isPulling, pullDistance, isRefreshing };
}
