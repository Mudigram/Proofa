"use client";

import { useEffect } from "react";
import { captureReferralSource } from "@/lib/telemetry";

/**
 * Captures referral attribution parameters (`?src=receipt&sid=...`) on first landing,
 * persists them to localStorage, cleans the URL bar, and dispatches the
 * `referral_landing_viewed` telemetry event.
 */
export default function ReferralTracker() {
    useEffect(() => {
        captureReferralSource();
    }, []);

    return null;
}
