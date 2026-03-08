import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-paystack-signature");

        if (!signature || !PAYSTACK_SECRET_KEY) {
            return new Response("Missing signature or secret", { status: 400 });
        }

        // 1. Verify Signature
        const hash = crypto
            .createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(body)
            .digest("hex");

        if (hash !== signature) {
            return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(body);
        console.log("[Paystack Webhook] Received event:", event.event);

        // 2. Handle Events
        switch (event.event) {
            case "charge.success":
                // Handle successful charge (usually for subscriptions)
                const customer = event.data.customer;
                const metadata = event.data.metadata; // If we sent metadata during checkout

                // If we have userId in metadata, update profile
                if (metadata?.userId) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_status: "active",
                            subscription_plan: metadata.plan || "pro",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", metadata.userId);
                }
                break;

            case "subscription.disable":
                // Handle cancelled or expired subscription
                const subMetadata = event.data.metadata;
                if (subMetadata?.userId) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_status: "inactive",
                            subscription_plan: "free",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", subMetadata.userId);
                }
                break;

            default:
                console.log("[Paystack Webhook] Unhandled event:", event.event);
        }

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("[Paystack Webhook] Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
