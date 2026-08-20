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
    /** Remaining watermark-free trial exports for free users */
    freeExportsLeft: number;
    /** Whether free user still has trial clean exports left */
    hasFreeExportsLeft: boolean;
    /**
     * Call this before any Pro-only action.
     * Returns `true` if allowed (user is Pro or has free export credits).
     * Returns `false` and triggers the upgrade modal if not.
     */
    gate: (variant?: UpgradeVariant) => boolean;
    /** The currently active upgrade prompt variant (null = closed) */
    activeVariant: UpgradeVariant | null;
    /** Close the upgrade prompt */
    closePrompt: () => void;
}

export function useProGate(): ProGateResult {
    const { isPro, isAuthenticated, freeExportsLeft, hasFreeExportsLeft, consumeFreeExport } = useAuth();
    const [activeVariant, setActiveVariant] = useState<UpgradeVariant | null>(null);

    const gate = useCallback(
        (variant: UpgradeVariant = "generic"): boolean => {
            if (isPro) return true;

            // Allow clean export if free trial exports remain
            if (variant === "export") {
                if (hasFreeExportsLeft) {
                    consumeFreeExport();
                    return true;
                }
            }

            // Respect session-level dismissals (don't re-prompt repeatedly in same session)
            const dismissKey = `proofa_upgrade_dismissed_${variant}`;
            const wasDismissed = sessionStorage.getItem(dismissKey) === "1";

            if (!wasDismissed) {
                setActiveVariant(variant);
            }

            // Free users are blocked when out of trial exports or tapping gated features
            return false;
        },
        [isPro, hasFreeExportsLeft, consumeFreeExport]
    );

    const closePrompt = useCallback(() => {
        if (activeVariant) {
            // Mark as dismissed for this session
            sessionStorage.setItem(`proofa_upgrade_dismissed_${activeVariant}`, "1");
        }
        setActiveVariant(null);
    }, [activeVariant]);

    return { isPro, isAuthenticated, freeExportsLeft, hasFreeExportsLeft, gate, activeVariant, closePrompt };
}
