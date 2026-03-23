/**
 * hooks/useDashboard.ts
 *
 * Updated to support Pro tier (limited view) alongside Business (full).
 *
 * Pro limits:
 *   - Period locked to 'month' (30 days max)
 *   - Activity feed capped at 10 items
 *   - Daily summary share locked (upgrade prompt shown in UI)
 *
 * Business:
 *   - All periods unlocked
 *   - Activity feed up to 20 items
 *   - All features available
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboardData } from "@/lib/dashboard";
import { DashboardPeriod, DashboardData } from "@/lib/types";
import { supabase } from "@/lib/supabase";

interface UseDashboardReturn {
    data: DashboardData | null;
    isLoading: boolean;
    error: string | null;
    period: DashboardPeriod;
    setPeriod: (p: DashboardPeriod) => void;
    refresh: () => Promise<void>;
    currency: string;
    setCurrency: (c: string) => void;
    // Tier capability flags — used by dashboard UI to show locks/prompts
    canChangePeriod: boolean; // Business only
    canShareSummary: boolean; // Business only
    activityLimit: number;  // 10 for Pro, 20 for Business
}

export function useDashboard(): UseDashboardReturn {
    const { user, profile, isPro, isBusiness } = useAuth();

    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currency, setCurrency] = useState(
        profile?.defaultCurrency ?? "NGN"
    );

    // Pro: locked to month. Business: any period.
    const [period, _setPeriod] = useState<DashboardPeriod>("month");

    const setPeriod = useCallback((p: DashboardPeriod) => {
        if (!isBusiness) return; // Pro users can't change period
        _setPeriod(p);
    }, [isBusiness]);

    // Capability flags
    const canChangePeriod = isBusiness;
    const canShareSummary = isBusiness;
    const activityLimit = isBusiness ? 20 : 10;

    // Resolve ownerId: staff use team_owner_id, owners use own id
    const ownerId = (profile as any)?.teamOwnerId ?? user?.id ?? null;

    const load = useCallback(async () => {
        if (!ownerId || !isPro) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await fetchDashboardData(
                ownerId,
                period,
                currency,
                activityLimit
            );
            setData(result);
        } catch (e) {
            setError("Failed to load dashboard. Please try again.");
            console.error("[useDashboard]", e);
        } finally {
            setLoading(false);
        }
    }, [ownerId, isPro, period, currency, activityLimit]);

    useEffect(() => { load(); }, [load]);

    // Real-time: refresh on new document insert
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        if (!ownerId || !isPro) return;

        const channel = supabase
            .channel(`documents:owner:${ownerId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "documents",
                    filter: `owner_id=eq.${ownerId}`,
                },
                () => { setTimeout(load, 500); }
            )
            .subscribe();

        channelRef.current = channel;
        return () => { channel.unsubscribe(); };
    }, [ownerId, isPro, load]);

    return {
        data,
        isLoading,
        error,
        period,
        setPeriod,
        refresh: load,
        currency,
        setCurrency,
        canChangePeriod,
        canShareSummary,
        activityLimit,
    };
}