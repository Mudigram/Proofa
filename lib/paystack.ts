/**
 * Paystack Server-side Utility
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    console.error("Missing PAYSTACK_SECRET_KEY environment variable.");
}

/**
 * Verify a transaction reference via Paystack API.
 * This should only be called from server-side (API routes).
 */
export async function verifyPaystackTransaction(reference: string) {
    if (!PAYSTACK_SECRET_KEY) {
        throw new Error("Paystack Secret Key is not configured.");
    }

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("[Paystack] Verification error:", error);
        return { status: false, message: "Verification failed." };
    }
}

/**
 * Initialize a subscription or check status if needed (optional helper).
 */
export async function getPaystackTransaction(transactionId: string) {
    if (!PAYSTACK_SECRET_KEY) {
        throw new Error("Paystack Secret Key is not configured.");
    }

    try {
        const response = await fetch(`https://api.paystack.co/transaction/${transactionId}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        return await response.json();
    } catch (error) {
        console.error("[Paystack] Fetch error:", error);
        return null;
    }
}
