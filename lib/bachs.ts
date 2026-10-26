/**
 * Bachs Payment Gateway Utility (International / USD)
 *
 * Documentation: https://bachs.io
 * Base URL: https://api.bachs.io (Production) / https://sandbox-api.bachs.io (Sandbox)
 */

const BACHS_API_URL =
  process.env.BACHS_API_URL ||
  (process.env.BACHS_SECRET_KEY?.startsWith("sk_sandbox_")
    ? "https://sandbox-api.bachs.io"
    : "https://api.bachs.io");

const BACHS_SECRET_KEY = process.env.BACHS_SECRET_KEY;
const BACHS_WEBHOOK_SECRET = process.env.BACHS_WEBHOOK_SECRET;

export interface CreateCheckoutParams {
  amount: number; // e.g. 5.00 or 50.00
  currency?: string; // default "USD"
  email: string;
  name?: string;
  plan: "pro" | "business";
  billing: "monthly" | "annual";
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Creates a Bachs Checkout Session for international / USD payments.
 */
export async function createBachsCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const {
    amount,
    currency = "USD",
    email,
    name,
    plan,
    billing,
    userId,
    successUrl,
    cancelUrl,
  } = params;

  if (!BACHS_SECRET_KEY) {
    console.warn(
      "[Bachs] BACHS_SECRET_KEY is not configured. Simulating checkout session for:",
      email,
      plan,
      amount
    );

    // Provide seamless fallback in dev/staging
    const mockSessionId = `chk_mock_${Date.now()}`;
    return {
      success: true,
      sessionId: mockSessionId,
      checkoutUrl: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id=${mockSessionId}&simulated=true`,
      simulated: true,
    };
  }

  try {
    const payload = {
      customer: {
        email,
        name: name || "Proofa Merchant",
      },
      pricing: {
        amount: Number(amount).toFixed(2),
        currency: currency.toUpperCase(),
      },
      product_cart: [
        {
          name: `Proofa ${plan.toUpperCase()} Plan (${billing})`,
          quantity: 1,
          unit_price: Number(amount).toFixed(2),
        },
      ],
      metadata: {
        userId,
        plan,
        billing,
        email,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    const response = await fetch(`${BACHS_API_URL}/v1/checkout-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BACHS_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[Bachs] Checkout session creation failed:", response.status, data);
      return {
        success: false,
        error: data.message || `Bachs returned HTTP ${response.status}`,
      };
    }

    const checkoutUrl =
      data.checkout_url || data.url || data.data?.checkout_url || data.data?.url;
    const sessionId = data.id || data.session_id || data.data?.id;

    if (!checkoutUrl) {
      return {
        success: false,
        error: "Bachs did not return a valid checkout URL.",
      };
    }

    return {
      success: true,
      checkoutUrl,
      sessionId,
    };
  } catch (error: any) {
    console.error("[Bachs] Network error while creating checkout session:", error);
    return {
      success: false,
      error: error.message || "Failed to reach Bachs API",
    };
  }
}

/**
 * Verify a Bachs checkout session or transaction status
 */
export async function getBachsCheckoutSession(sessionId: string) {
  if (!BACHS_SECRET_KEY) {
    if (sessionId.startsWith("chk_mock_")) {
      return {
        id: sessionId,
        status: "COMPLETED",
        metadata: { plan: "pro", billing: "monthly" },
        simulated: true,
      };
    }
    throw new Error("Bachs Secret Key is not configured.");
  }

  try {
    const response = await fetch(`${BACHS_API_URL}/v1/checkout-sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${BACHS_SECRET_KEY}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Bachs] Fetch session error:", error);
    return null;
  }
}

export { BACHS_WEBHOOK_SECRET };
