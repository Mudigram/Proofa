import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const auth = await requireAdmin(req);
        if (!auth.ok) return auth.response;

        const { action, userId, plan, status, durationDays, email } = body;

        if (!action) {
            return NextResponse.json({ error: "Missing required field: action" }, { status: 400 });
        }

        // ── Action 1: Update Plan / Grant Promo ───────────────────────────────
        if (action === "update_plan") {
            if (!userId) {
                return NextResponse.json({ error: "Missing userId" }, { status: 400 });
            }

            const targetPlan = plan || "pro";
            const targetStatus = status || "active";
            const isBusiness = targetPlan === "business";

            let renewalDate: string | null = null;
            if (durationDays && Number(durationDays) > 0) {
                renewalDate = new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000).toISOString();
            } else if (targetPlan === "free") {
                renewalDate = null;
            }

            const updates: Record<string, any> = {
                subscription_plan: targetPlan,
                subscription_status: targetStatus,
                is_business: isBusiness,
                subscription_renewal_date: renewalDate,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabaseAdmin
                .from("profiles")
                .upsert({
                    id: userId,
                    ...updates,
                })
                .select("*")
                .single();

            if (error) {
                console.error("[Admin Manage] Update plan error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                message: `User upgraded to ${targetPlan.toUpperCase()} (${targetStatus})`,
                profile: data,
            });
        }

        // ── Action 2: Trigger Password Reset ──────────────────────────────────
        if (action === "reset_password") {
            if (!email) {
                return NextResponse.json({ error: "Missing email for password reset" }, { status: 400 });
            }

            // Generate recovery link
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: "recovery",
                email: email.trim(),
            });

            // Also trigger standard email dispatch
            try {
                await supabaseAdmin.auth.resetPasswordForEmail(email.trim());
            } catch (err) {
                console.warn("[Admin Manage] Reset email dispatch warning:", err);
            }

            if (linkError) {
                console.error("[Admin Manage] Generate recovery link error:", linkError);
                return NextResponse.json({ error: linkError.message }, { status: 500 });
            }

            const recoveryUrl = linkData?.properties?.action_link || null;

            return NextResponse.json({
                success: true,
                message: `Password reset link generated for ${email}`,
                recoveryUrl,
            });
        }

        // ── Action 3: Inspect User Cloud Documents ────────────────────────────
        if (action === "fetch_user_docs") {
            if (!userId) {
                return NextResponse.json({ error: "Missing userId" }, { status: 400 });
            }

            const { data: docs, error: docsError } = await supabaseAdmin
                .from("documents")
                .select("id, type, template, amount, currency, customer_name, customer_phone, created_at, updated_at")
                .eq("owner_id", userId)
                .is("deleted_at", null)
                .order("created_at", { ascending: false })
                .limit(20);

            if (docsError) {
                console.error("[Admin Manage] Fetch user docs error:", docsError);
                return NextResponse.json({ error: docsError.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                documents: docs || [],
            });
        }

        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    } catch (err: any) {
        console.error("[Admin User Manage] Unexpected error:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}
