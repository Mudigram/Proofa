import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// useProGate
//
// The central hook for all Pro feature gating.
// Usage:
//   const { isPro, gate } = useProGate();
//   if (!gate("logo")) return; // shows UpgradePrompt and returns false
//
// ─────────────────────────────────────────────────────────────────────────────

export type UpgradeVariant = "export" | "logo" | "colors" | "generic";

interface ProGateResult {
    /** Whether the current user has an active Pro/Business plan */
    isPro: boolean;
    /** Whether the current user is signed in */
    isAuthenticated: boolean;
    /**
     * Call this before any Pro-only action.
     * Returns `true` if allowed (user is Pro).
     * Returns `false` and triggers the upgrade modal if not.
     */
    gate: (variant?: UpgradeVariant) => boolean;
    /** The currently active upgrade prompt variant (null = closed) */
    activeVariant: UpgradeVariant | null;
    /** Close the upgrade prompt */
    closePrompt: () => void;
}

export function useProGate(): ProGateResult {
    const { isPro, isAuthenticated } = useAuth();
    const [activeVariant, setActiveVariant] = useState<UpgradeVariant | null>(null);

    const gate = useCallback(
        (variant: UpgradeVariant = "generic"): boolean => {
            if (isPro) return true;

            // Respect session-level dismissals (don't re-prompt same session)
            const dismissKey = `proofa_upgrade_dismissed_${variant}`;
            const wasDismissed = sessionStorage.getItem(dismissKey) === "1";
            if (wasDismissed) return false;

            setActiveVariant(variant);
            return false;
        },
        [isPro]
    );

    const closePrompt = useCallback(() => {
        if (activeVariant) {
            // Mark as dismissed for this session
            sessionStorage.setItem(`proofa_upgrade_dismissed_${activeVariant}`, "1");
        }
        setActiveVariant(null);
    }, [activeVariant]);

    return { isPro, isAuthenticated, gate, activeVariant, closePrompt };
}
