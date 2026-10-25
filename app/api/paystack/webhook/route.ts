import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-paystack-signature");

        if (!signature || !PAYSTACK_SECRET_KEY) {
            console.error("[Paystack Webhook] Missing signature or secret key.");
            return new Response("Missing signature or secret", { status: 400 });
        }

        // 1. Verify Signature
        const hash = crypto
            .createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(body)
            .digest("hex");

        if (hash !== signature) {
            console.error("[Paystack Webhook] Invalid signature.");
            return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(body);
        console.log("[Paystack Webhook] Received event:", event.event);

        // 2. Handle Events
        switch (event.event) {
            case "charge.success": {
                let metadata = event.data?.metadata;
                if (typeof metadata === "string") {
                    try {
                        metadata = JSON.parse(metadata);
                    } catch {
                        metadata = {};
                    }
                }

                // Look for userId in metadata (top-level camelCase, snake_case, or custom_fields)
                let userId = metadata?.userId || metadata?.user_id;
                if (!userId && Array.isArray(metadata?.custom_fields)) {
                    const field = metadata.custom_fields.find(
                        (f: any) => f.variable_name === "user_id" || f.variable_name === "userId"
                    );
                    if (field) userId = field.value;
                }

                const customerEmail = event.data?.customer?.email;

                // Fallback: match by customer email in auth.users
                if (!userId && customerEmail) {
                    try {
                        const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
                        const matchingUser = authData?.users?.find(
                            (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
                        );
                        if (matchingUser) {
                            userId = matchingUser.id;
                            console.log(`[Paystack Webhook] Resolved userId ${userId} via customer email ${customerEmail}`);
                        }
                    } catch (err) {
                        console.error("[Paystack Webhook] Error resolving user by email:", err);
                    }
                }

                if (!userId) {
                    console.error("[Paystack Webhook] Could not determine userId for charge reference:", event.data?.reference);
                    break;
                }

                const targetPlan = metadata?.plan || "pro";
                const isBusiness = targetPlan === "business";
                const amountInNaira = (event.data?.amount || 0) / 100;
                const isAnnual = amountInNaira >= 20000;
                const renewalDays = isAnnual ? 365 : 30;
                const renewalDate = new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000).toISOString();

                const { error: updateError } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "active",
                        subscription_plan: targetPlan,
                        is_business: isBusiness,
                        subscription_renewal_date: renewalDate,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", userId);

                if (updateError) {
                    console.error("[Paystack Webhook] Failed to update profile:", updateError);
                } else {
                    console.log(`[Paystack Webhook] Successfully activated ${targetPlan} for user ${userId}`);
                }
                break;
            }

            case "subscription.disable": {
                let subMetadata = event.data?.metadata;
                if (typeof subMetadata === "string") {
                    try { subMetadata = JSON.parse(subMetadata); } catch { subMetadata = {}; }
                }

                let subUserId = subMetadata?.userId || subMetadata?.user_id;
                const customerEmail = event.data?.customer?.email;

                if (!subUserId && customerEmail) {
                    try {
                        const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
                        const matchingUser = authData?.users?.find(
                            (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
                        );
                        if (matchingUser) subUserId = matchingUser.id;
                    } catch {}
                }

                if (subUserId) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            subscription_status: "inactive",
                            subscription_plan: "free",
                            is_business: false,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", subUserId);
                }
                break;
            }

            default:
                console.log("[Paystack Webhook] Unhandled event:", event.event);
        }

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("[Paystack Webhook] Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
