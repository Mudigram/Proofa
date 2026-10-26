import { NextResponse } from "next/server";
import { getBachsCheckoutSession } from "@/lib/bachs";
import { supabaseAdmin } from "@/lib/supabase";
import { sendUpgradeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { sessionId, plan, userId, cycle } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    let targetPlan = (plan || "pro").toLowerCase();
    const isAnnual = cycle === "annual";

    // If session ID was provided and not simulated, verify with Bachs API
    if (sessionId && !sessionId.startsWith("chk_mock_")) {
      const session = await getBachsCheckoutSession(sessionId);
      if (session) {
        if (session.metadata?.plan) targetPlan = session.metadata.plan;
      }
    }

    const isBusiness = targetPlan === "business";
    const renewalDays = isAnnual ? 365 : 30;
    const renewalDate = new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_plan: targetPlan,
        subscription_status: "active",
        is_business: isBusiness,
        subscription_renewal_date: renewalDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      console.error("[Bachs Verify API] Update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile", details: error.message },
        { status: 500 }
      );
    }

    // Try sending confirmation email if user has email in auth
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userData?.user?.email) {
        sendUpgradeEmail(
          userData.user.email,
          targetPlan,
          isAnnual ? "50.00" : "5.00",
          "USD",
          updatedProfile?.business_name
        ).catch(() => {});
      }
    } catch (e) {
      console.warn("[Bachs Verify API] Could not send confirmation email:", e);
    }

    return NextResponse.json({
      success: true,
      plan: targetPlan,
      isAnnual,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("[Bachs Verify API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
