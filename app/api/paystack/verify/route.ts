import { NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { reference, plan, userId } = await req.json();

        if (!reference || !userId) {
            return NextResponse.json({ error: "Missing reference or userId" }, { status: 400 });
        }

        // 1. Verify with Paystack
        const verification = await verifyPaystackTransaction(reference);

        if (!verification.status || verification.data.status !== "success") {
            return NextResponse.json(
                { error: "Payment verification failed", details: verification.message },
                { status: 400 }
            );
        }

        // 2. Validate and calculate duration
        const targetPlan = plan || "pro";
        const isBusiness = targetPlan === "business";
        const amountInNaira = (verification.data?.amount || 0) / 100;
        const isAnnual = amountInNaira >= 20000;
        const renewalDays = isAnnual ? 365 : 30;
        const renewalDate = new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000).toISOString();

        // 3. Update User Profile in Supabase using Admin client
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                subscription_plan: targetPlan,
                subscription_status: "active",
                is_business: isBusiness,
                subscription_renewal_date: renewalDate,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (error) {
            console.error("[Verify API] Profile update error:", error);
            return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, plan: targetPlan, isAnnual });
    } catch (error) {
        console.error("[Verify API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
