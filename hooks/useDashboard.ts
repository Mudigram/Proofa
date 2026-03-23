/**
 * hooks/useDashboard.ts
 *
 * Data hook for the Business Plan dashboard.
 * Handles period selection, loading state, error state,
 * and Supabase real-time subscription for live updates.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboardData } from "@/lib/dashboard";
import {
    DashboardPeriod,
    DashboardData,
} from "@/lib/types";
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
}

export function useDashboard(): UseDashboardReturn {
    const { user, profile, isBusiness } = useAuth();

    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<DashboardPeriod>("month");
    const [currency, setCurrency] = useState(profile?.defaultCurrency ?? "NGN");

    // ownerId: for staff this is team_owner_id, for owners it's own id
    // AuthContext exposes profile — we rely on get_owner_id() in RLS,
    // but for queries we need to pass the right owner id explicitly.
    // If profile has teamOwnerId set, use that; otherwise use own id.
    const ownerId = (profile as any)?.teamOwnerId ?? user?.id ?? null;

    const load = useCallback(async () => {
        if (!ownerId || !isBusiness) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await fetchDashboardData(ownerId, period, currency);
            setData(result);
        } catch (e) {
            setError("Failed to load dashboard. Please try again.");
            console.error("[useDashboard]", e);
        } finally {
            setLoading(false);
        }
    }, [ownerId, isBusiness, period, currency]);

    // Initial load + reload on period/currency change
    useEffect(() => { load(); }, [load]);

    // ── Real-time: refresh when a new document is inserted ──────────────────
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        if (!ownerId) return;

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
                () => {
                    // Debounce: wait 500ms in case of rapid inserts
                    setTimeout(load, 500);
                }
            )
            .subscribe();

        channelRef.current = channel;
        return () => { channel.unsubscribe(); };
    }, [ownerId, load]);

    return {
        data,
        isLoading,
        error,
        period,
        setPeriod,
        refresh: load,
        currency,
        setCurrency,
    };
}