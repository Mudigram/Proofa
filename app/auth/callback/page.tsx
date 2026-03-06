"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Handles Supabase OAuth redirect callbacks.
 * Supabase redirects here after email confirmation or social OAuth.
 * It reads the URL hash, sets the session, then forwards to the home page.
 */
export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Supabase automatically reads the hash and sets the session
        supabase.auth.getSession().then(() => {
            router.replace("/");
        });
    }, [router]);

    return (
        <main className="app-container min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-surface-400 font-medium text-sm">Signing you in…</p>
            </div>
        </main>
    );
}
