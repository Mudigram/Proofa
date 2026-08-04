"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getUserProfile } from "@/lib/auth";
import { UserProfile, SubscriptionPlan } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Context Shape
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
    /** The raw Supabase user (null if anonymous) */
    user: User | null;
    /** Full profile from our `profiles` table (null if anonymous or loading) */
    profile: UserProfile | null;
    /** true while the initial session check is running */
    isLoading: boolean;
    /** Convenience: true if the user is logged in */
    isAuthenticated: boolean;
    /** Convenience: true if user has an active Pro or Business plan */
    isPro: boolean;
    /** Convenience: true if user has an active Business plan */
    isBusiness: boolean;
    /** Current plan tier */
    plan: SubscriptionPlan;
    /** Re-fetch the profile (e.g. after plan upgrade) */
    refreshProfile: () => Promise<void>;
    /** Sign out and reset state */
    signOut: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context + Provider
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Fetch profile from Supabase ──────────────────────────────────────────
    const fetchProfile = useCallback(async (authUser: User) => {
        try {
            const data = await getUserProfile(authUser.id);
            if (data) {
                // Merge in the email and name from auth.users
                data.email = authUser.email;
                data.name = authUser.user_metadata?.name || null;
                setProfile(data);
                if (typeof window !== "undefined") {
                    localStorage.setItem("proofa_cached_profile", JSON.stringify(data));
                }
            } else if (typeof window !== "undefined") {
                const cached = localStorage.getItem("proofa_cached_profile");
                if (cached) {
                    setProfile(JSON.parse(cached));
                } else {
                    setProfile(null);
                }
            }
        } catch {
            if (typeof window !== "undefined") {
                const cached = localStorage.getItem("proofa_cached_profile");
                if (cached) {
                    try { setProfile(JSON.parse(cached)); } catch { setProfile(null); }
                } else {
                    setProfile(null);
                }
            }
        }
    }, []);

    // ── Load session on mount + subscribe to auth changes ───────────────────
    useEffect(() => {
        // Grab the current session immediately (from localStorage if persisted)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user).finally(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth state changes (login, logout, token refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    // ── Derived state ────────────────────────────────────────────────────────
    const isTempPro = typeof window !== "undefined" && localStorage.getItem("proofa_temp_pro") === "1";
    const isBusiness = profile?.isBusiness || profile?.subscriptionPlan === "business";
    const plan: SubscriptionPlan = isBusiness ? "business" : (isTempPro ? "pro" : (profile?.subscriptionPlan ?? "free"));
    const isPro = plan === "pro" || plan === "business" || isTempPro;

    // ── Actions ──────────────────────────────────────────────────────────────
    const refreshProfile = useCallback(async () => {
        if (user) await fetchProfile(user);
    }, [user, fetchProfile]);

    const handleSignOut = useCallback(async () => {
        await supabase.auth.signOut();
        if (typeof window !== "undefined") {
            localStorage.removeItem("proofa_cached_profile");
            localStorage.removeItem("proofa_temp_pro");
            localStorage.removeItem("proofa_bank_vault");
        }
        setSession(null);
        setUser(null);
        setProfile(null);
    }, []);

    const value: AuthContextValue = {
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        isPro,
        isBusiness,
        plan,
        refreshProfile,
        signOut: handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Access auth state anywhere in the app.
 *
 * @example
 * const { isPro, user, isAuthenticated } = useAuth();
 */
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an <AuthProvider>");
    }
    return ctx;
}
