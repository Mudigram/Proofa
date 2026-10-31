import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const auth = await requireAdmin(req);
        if (!auth.ok) return auth.response;

        // 1. Fetch all users from Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
        });

        if (authError) {
            console.error("[Admin API] Auth fetch error:", authError);
            return NextResponse.json(
                { error: "Failed to fetch auth users", details: authError.message },
                { status: 500 }
            );
        }

        const users = authData?.users || [];

        // 2. Fetch profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("*");

        if (profilesError) {
            console.warn("[Admin API] Profiles fetch warning:", profilesError);
        }

        const profilesMap = new Map<string, any>();
        (profiles || []).forEach((p) => {
            profilesMap.set(p.id, p);
        });

        // 3. Fetch documents
        const { data: documents, error: docsError } = await supabaseAdmin
            .from("documents")
            .select("id, owner_id, type, amount, currency, created_at, deleted_at");

        if (docsError) {
            console.warn("[Admin API] Documents fetch warning:", docsError);
        }

        const validDocs = (documents || []).filter((d) => !d.deleted_at);

        // 4. Per-user document aggregations
        const userDocStats = new Map<string, { count: number; totalVolume: number; latestDoc: string | null }>();

        validDocs.forEach((doc) => {
            if (!doc.owner_id) return;
            const current = userDocStats.get(doc.owner_id) || { count: 0, totalVolume: 0, latestDoc: null };
            current.count += 1;
            current.totalVolume += Number(doc.amount) || 0;
            if (!current.latestDoc || new Date(doc.created_at) > new Date(current.latestDoc)) {
                current.latestDoc = doc.created_at;
            }
            userDocStats.set(doc.owner_id, current);
        });

        // 5. Build enriched user list
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let newUsers7d = 0;
        let newUsers30d = 0;
        const planCounts = { free: 0, pro: 0, business: 0 };

        const enrichedUsers = users.map((u) => {
            const profile = profilesMap.get(u.id);
            const docStats = userDocStats.get(u.id) || { count: 0, totalVolume: 0, latestDoc: null };
            const createdAtDate = new Date(u.created_at);

            if (createdAtDate >= sevenDaysAgo) newUsers7d += 1;
            if (createdAtDate >= thirtyDaysAgo) newUsers30d += 1;

            const plan = (profile?.subscription_plan || "free").toLowerCase();
            if (plan === "business") planCounts.business += 1;
            else if (plan === "pro") planCounts.pro += 1;
            else planCounts.free += 1;

            return {
                id: u.id,
                email: u.email || "No email",
                name: u.user_metadata?.name || profile?.business_name || null,
                businessName: profile?.business_name || null,
                plan: profile?.subscription_plan || "free",
                subscriptionStatus: profile?.subscription_status || "inactive",
                createdAt: u.created_at,
                lastSignInAt: u.last_sign_in_at || null,
                docCount: docStats.count,
                totalVolume: docStats.totalVolume,
                latestDoc: docStats.latestDoc,
            };
        });

        // Sort users: latest created first
        enrichedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // 6. Platform summary
        const docTypeCounts = { receipt: 0, invoice: 0, order: 0 };
        let totalVolumeNGN = 0;
        let totalVolumeUSD = 0;

        validDocs.forEach((d) => {
            const t = (d.type || "").toLowerCase();
            if (t.includes("receipt")) docTypeCounts.receipt += 1;
            else if (t.includes("invoice")) docTypeCounts.invoice += 1;
            else if (t.includes("order")) docTypeCounts.order += 1;

            const amt = Number(d.amount) || 0;
            if ((d.currency || "NGN").toUpperCase() === "USD") {
                totalVolumeUSD += amt;
            } else {
                totalVolumeNGN += amt;
            }
        });

        // 7. Fetch Shadow Leads (Anonymous & Free telemetry profiles)
        const { data: shadowProfiles, error: shadowError } = await supabaseAdmin
            .from("shadow_profiles")
            .select("*")
            .order("last_active_at", { ascending: false })
            .limit(500);

        if (shadowError) {
            console.warn("[Admin API] Shadow profiles fetch warning:", shadowError);
        }

        const rawShadow = shadowProfiles || [];
        let shadowTotalVolumeNGN = 0;
        let shadowLeadsWithPhone = 0;
        let shadowHighVolumeCount = 0;
        let shadowBrandConsciousCount = 0;

        const enrichedShadow = rawShadow.map((sp: any) => {
            const volNGN = Number(sp.total_volume_ngn) || 0;
            shadowTotalVolumeNGN += volNGN;
            if (sp.contact_phone) shadowLeadsWithPhone += 1;
            const tags: string[] = Array.isArray(sp.feature_tags) ? sp.feature_tags : [];
            if (tags.includes("High Volume")) shadowHighVolumeCount += 1;
            if (tags.includes("Brand Conscious")) shadowBrandConsciousCount += 1;

            return {
                id: sp.id,
                userId: sp.user_id,
                businessName: sp.business_name || "Anonymous Merchant",
                contactPhone: sp.contact_phone || null,
                contactEmail: sp.contact_email || null,
                devicePlatform: sp.device_platform || "Unknown",
                isPWA: Boolean(sp.is_pwa),
                totalDocs: sp.total_docs_count || 0,
                receiptCount: sp.receipt_count || 0,
                invoiceCount: sp.invoice_count || 0,
                orderCount: sp.order_count || 0,
                totalVolumeNGN: volNGN,
                totalVolumeUSD: Number(sp.total_volume_usd) || 0,
                topItems: Array.isArray(sp.top_items) ? sp.top_items : [],
                featureTags: tags,
                firstSeenAt: sp.first_seen_at,
                lastActiveAt: sp.last_active_at,
                lastEvent: sp.last_event,
            };
        });

        const estimatedMRR = (planCounts.pro * 2500) + (planCounts.business * 5000);

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers: users.length,
                newUsers7d,
                newUsers30d,
                planCounts,
                estimatedMRR,
                totalDocs: validDocs.length,
                docTypeCounts,
                totalVolumeNGN,
                totalVolumeUSD,
                shadowMerchantsCount: enrichedShadow.length,
                shadowTotalVolumeNGN,
                shadowLeadsWithPhone,
                shadowHighVolumeCount,
                shadowBrandConsciousCount,
            },
            users: enrichedUsers,
            shadowLeads: enrichedShadow,
        });
    } catch (error: any) {
        console.error("[Admin API] Server error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error?.message },
            { status: 500 }
        );
    }
}
