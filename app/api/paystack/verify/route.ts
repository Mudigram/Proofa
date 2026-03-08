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

        // 2. Validate amount if needed (optional but recommended)
        // const amount = verification.data.amount; 

        // 3. Update User Profile in Supabase using Admin client
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                subscription_plan: plan || "pro",
                subscription_status: "active",
                subscription_renewal_date: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (error) {
            console.error("[Verify API] Profile update error:", error);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        return NextResponse.json({ success: true, plan });
    } catch (error) {
        console.error("[Verify API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
