/**
 * Haptic feedback utility using the Vibration API.
 * Provides subtle tactile responses for mobile interactions.
 */

export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" = "light") {
    if (typeof window === "undefined" || !("vibrate" in navigator)) return;

    try {
        switch (type) {
            case "light":
                navigator.vibrate(8);
                break;
            case "medium":
                navigator.vibrate(16);
                break;
            case "heavy":
                navigator.vibrate(30);
                break;
            case "success":
                navigator.vibrate([10, 30, 10]);
                break;
        }
    } catch {
        // Silently ignore if Vibration API permission is restricted
    }
}
