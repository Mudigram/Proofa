"use client";

import { useState, useCallback } from "react";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
interface PaystackConfig {
    email: string;
    amount: number;
    metadata?: {
        userId: string;
        plan: string;
    };
    onSuccess: (reference: string) => void;
    onClose: () => void;
}

/**
 * usePaystack Hook
 * 
 * Handles loading the Paystack Inline script and initiating the checkout flow.
 */
export function usePaystack() {
    const [loading, setLoading] = useState(false);

    const initializePayment = useCallback(async (config: PaystackConfig) => {
        if (!PAYSTACK_PUBLIC_KEY) {
            console.error("[Paystack] Public Key is missing in environment variables.");
            return;
        }

        setLoading(true);

        // 1. Ensure Paystack script is loaded
        if (!(window as any).PaystackPop) {
            const script = document.createElement("script");
            script.src = "https://js.paystack.co/v1/inline.js";
            script.async = true;
            document.body.appendChild(script);

            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }

        // 2. Setup and open Paystack checkout
        const handler = (window as any).PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: config.email,
            amount: config.amount * 100, // amount in kobo (NGN)
            currency: "NGN",
            metadata: {
                custom_fields: [
                    {
                        display_name: "Plan",
                        variable_name: "plan",
                        value: config.metadata?.plan || "pro"
                    },
                    {
                        display_name: "User ID",
                        variable_name: "user_id",
                        value: config.metadata?.userId || ""
                    }
                ],
                ...config.metadata
            },
            callback: (response: { reference: string }) => {
                setLoading(false);
                config.onSuccess(response.reference);
            },
            onClose: () => {
                setLoading(false);
                config.onClose();
            },
        });

        handler.openIframe();
    }, []);

    return { initializePayment, loading };
}
