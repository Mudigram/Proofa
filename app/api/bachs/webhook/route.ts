import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { BACHS_WEBHOOK_SECRET } from "@/lib/bachs";
import { sendUpgradeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-bachs-signature") || req.headers.get("bachs-signature");

    // 1. Signature Verification (if secret configured)
    if (BACHS_WEBHOOK_SECRET) {
      if (!signature) {
        console.error("[Bachs Webhook] Missing signature header.");
        return new Response("Missing signature header", { status: 400 });
      }

      const hmac = crypto
        .createHmac("sha256", BACHS_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (hmac !== signature) {
        console.error("[Bachs Webhook] Invalid HMAC signature.");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log("[Bachs Webhook] Received event:", event.type || event.event);

    const eventType = event.type || event.event;
    const data = event.data || event;

    // Handle successful payment events
    const isPaymentSuccess =
      eventType === "collection.succeeded" ||
      eventType === "checkout.completed" ||
      eventType === "charge.success" ||
      data.status === "SUCCEEDED" ||
      data.status === "COMPLETED";

    if (isPaymentSuccess) {
      const metadata = data.metadata || {};
      let userId = metadata.userId || metadata.user_id;
      const targetPlan = (metadata.plan || "pro").toLowerCase();
      const billing = metadata.billing || "monthly";
      const customerEmail = metadata.email || data.customer?.email || data.customer_email;

      // Fallback: match user by customer email if userId not explicitly in metadata
      if (!userId && customerEmail) {
        try {
          const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
          const matching = authData?.users?.find(
            (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
          );
          if (matching) userId = matching.id;
        } catch (err) {
          console.warn("[Bachs Webhook] Could not query user by email:", err);
        }
      }

      if (!userId) {
        console.error("[Bachs Webhook] Could not resolve userId for event:", event.id || data.id);
        return NextResponse.json({ received: true, warning: "User not resolved" });
      }

      const isAnnual = billing === "annual" || Number(data.amount || 0) >= 40;
      const renewalDays = isAnnual ? 365 : 30;
      const renewalDate = new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000).toISOString();
      const isBusiness = targetPlan === "business";

      // Update Supabase profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_plan: targetPlan,
          subscription_status: "active",
          is_business: isBusiness,
          subscription_renewal_date: renewalDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        console.error("[Bachs Webhook] Supabase profile update error:", profileError);
      } else {
        console.log(`[Bachs Webhook] Successfully activated ${targetPlan} (${billing}) for user ${userId}`);
      }

      // Send upgrade confirmation email via Sendly
      if (customerEmail) {
        const amountDisplay = data.amount ? String(data.amount) : isAnnual ? "50.00" : "5.00";
        sendUpgradeEmail(
          customerEmail,
          targetPlan,
          amountDisplay,
          data.currency || "USD"
        ).catch((err) => console.warn("[Bachs Webhook] Sendly upgrade email error:", err));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Bachs Webhook] Processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
