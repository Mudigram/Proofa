import { NextResponse } from "next/server";
import { createBachsCheckoutSession } from "@/lib/bachs";

const USD_PRICES = {
  pro: {
    monthly: 5,
    annual: 50,
  },
  business: {
    monthly: 10,
    annual: 100,
  },
} as const;

export async function POST(req: Request) {
  try {
    const { plan, billing, userId, email, businessName } = await req.json();

    if (!plan || !userId || !email) {
      return NextResponse.json(
        { error: "Missing required parameters: plan, userId, or email" },
        { status: 400 }
      );
    }

    if (plan !== "pro" && plan !== "business") {
      return NextResponse.json(
        { error: "Invalid plan selected for checkout" },
        { status: 400 }
      );
    }

    const selectedPlan = plan as "pro" | "business";
    const billingCycle: "monthly" | "annual" = billing === "annual" ? "annual" : "monthly";
    const amount = USD_PRICES[selectedPlan][billingCycle];

    // Determine host origin for callbacks
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "https://www.proofa.ng";

    const successUrl = `${origin}/pricing?bachs=success&plan=${selectedPlan}&cycle=${billingCycle}`;
    const cancelUrl = `${origin}/pricing?bachs=cancel`;

    const result = await createBachsCheckoutSession({
      amount,
      currency: "USD",
      email: email.trim(),
      name: businessName?.trim() || "Proofa Merchant",
      plan: selectedPlan,
      billing: billingCycle,
      userId,
      successUrl,
      cancelUrl,
    });

    if (!result.success || !result.checkoutUrl) {
      return NextResponse.json(
        { error: result.error || "Failed to initialize Bachs checkout session" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
      simulated: result.simulated,
    });
  } catch (error: any) {
    console.error("[Bachs Checkout API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
