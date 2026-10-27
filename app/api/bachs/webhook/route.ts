import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { BACHS_WEBHOOK_SECRET } from "@/lib/bachs";
import { sendUpgradeEmail } from "@/lib/email";

/**
 * Bachs Webhook Verification
 * Supports both:
 * 1. Standard Bachs format: HMAC over "{timestamp}.{raw_body}" with X-Bachs-Timestamp & X-Bachs-Signature
 * 2. V2 format: t={timestamp},v1={signature}
 * 3. Fallback: HMAC directly over raw_body
 */
function verifyBachsSignature(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  let timestamp = timestampHeader || "";
  let signaturesToTest: string[] = [];

  // Check if signature header is formatted as "t=...,v1=..."
  if (signatureHeader.includes("v1=")) {
    const parts = signatureHeader.split(",");
    for (const part of parts) {
      const [key, val] = part.trim().split("=");
      if (key === "t" && !timestamp) {
        timestamp = val;
      } else if (key === "v1" && val) {
        signaturesToTest.push(val.trim());
      }
    }
  } else {
    signaturesToTest.push(signatureHeader.trim());
  }

  if (signaturesToTest.length === 0) return false;

  // Build expected digests
  const candidatePayloads: string[] = [];
  if (timestamp) {
    candidatePayloads.push(`${timestamp}.${rawBody}`);
  }
  // Also add rawBody directly as fallback
  candidatePayloads.push(rawBody);

  for (const payload of candidatePayloads) {
    const expectedDigest = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    for (const receivedSig of signaturesToTest) {
      if (receivedSig.length === expectedDigest.length) {
        try {
          if (crypto.timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedDigest))) {
            return true;
          }
        } catch {
          // length mismatch or buffer error
        }
      }
    }
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get("x-bachs-signature") ||
      req.headers.get("bachs-signature") ||
      req.headers.get("x-bachs-signature-v2");
    const timestampHeader =
      req.headers.get("x-bachs-timestamp") ||
      req.headers.get("bachs-timestamp");

    // 1. Signature Verification (enforced whenever BACHS_WEBHOOK_SECRET is set)
    if (BACHS_WEBHOOK_SECRET) {
      if (!signatureHeader) {
        console.error("[Bachs Webhook] Missing signature header.");
        return new Response("Missing signature header", { status: 400 });
      }

      const isValid = verifyBachsSignature(
        rawBody,
        signatureHeader,
        timestampHeader,
        BACHS_WEBHOOK_SECRET
      );

      if (!isValid) {
        console.error("[Bachs Webhook] Invalid HMAC signature.");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const rawType = (event.type || event.event || "").toLowerCase().replace(/[\s_]/g, ".");
    const data = event.data || event;

    console.log("[Bachs Webhook] Received event:", rawType || "unknown");

    // Handle payment / checkout success events
    const isPaymentSuccess =
      rawType === "checkout.completed" ||
      rawType === "collection.succeeded" ||
      rawType === "invoice.paid" ||
      rawType === "customer.subscription.created" ||
      rawType === "customer.subscription.updated" ||
      rawType === "charge.success" ||
      data.status === "SUCCEEDED" ||
      data.status === "COMPLETED" ||
      data.status === "PAID";

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

    // Handle cancellation / subscription deletion
    const isCancellation =
      rawType === "customer.subscription.deleted" ||
      rawType === "subscription.cancelled" ||
      data.status === "CANCELLED";

    if (isCancellation) {
      const metadata = data.metadata || {};
      let userId = metadata.userId || metadata.user_id;
      const customerEmail = metadata.email || data.customer?.email || data.customer_email;

      if (!userId && customerEmail) {
        try {
          const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
          const matching = authData?.users?.find(
            (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
          );
          if (matching) userId = matching.id;
        } catch (err) {
          console.warn("[Bachs Webhook] Error resolving user on cancellation:", err);
        }
      }

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        console.log(`[Bachs Webhook] Marked subscription cancelled for user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Bachs Webhook] Processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
