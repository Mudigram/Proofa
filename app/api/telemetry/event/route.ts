import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface EventBody {
    shadowId: string;
    userId?: string | null;
    eventType: string;
    eventName: string;
    properties?: Record<string, any>;
    merchantProfile?: {
        businessName?: string | null;
        contactPhone?: string | null;
        contactEmail?: string | null;
        businessAddress?: string | null;
        bankName?: string | null;
        accountNumber?: string | null;
    };
    device?: {
        platform: string;
        isMobile: boolean;
        isPWA: boolean;
        isInAppWebview: boolean;
    };
    timestamp?: string;
}

export async function POST(req: Request) {
    try {
        let body: EventBody;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const { shadowId, userId, eventType, eventName, properties = {}, merchantProfile, device, timestamp } = body;

        if (!shadowId || !eventName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const eventTime = timestamp || new Date().toISOString();

        // 1. Log raw telemetry event to Supabase
        const eventInsertPromise = supabaseAdmin.from("telemetry_events").insert({
            shadow_id: shadowId,
            user_id: userId || null,
            event_name: eventName,
            event_type: eventType || "generic",
            properties: properties,
            merchant_profile: merchantProfile || {},
            device: device || {},
            created_at: eventTime,
        });

        // 2. Fetch existing shadow profile to compute rolling aggregates
        const { data: existingProfile } = await supabaseAdmin
            .from("shadow_profiles")
            .select("*")
            .eq("id", shadowId)
            .maybeSingle();

        const currentProfile = existingProfile || {
            id: shadowId,
            user_id: userId || null,
            business_name: null,
            contact_phone: null,
            contact_email: null,
            device_platform: device?.platform || "Unknown",
            is_pwa: Boolean(device?.isPWA),
            total_docs_count: 0,
            receipt_count: 0,
            invoice_count: 0,
            order_count: 0,
            total_volume_ngn: 0,
            total_volume_usd: 0,
            top_items: [],
            feature_tags: [],
            first_seen_at: eventTime,
            last_active_at: eventTime,
            last_event: eventName,
        };

        // Determine updates
        const updates: Record<string, any> = {
            id: shadowId,
            user_id: userId || currentProfile.user_id || null,
            device_platform: device?.platform || currentProfile.device_platform,
            is_pwa: device?.isPWA !== undefined ? Boolean(device.isPWA) : currentProfile.is_pwa,
            last_active_at: eventTime,
            last_event: eventName,
            updated_at: new Date().toISOString(),
        };

        if (merchantProfile?.businessName && merchantProfile.businessName.trim()) {
            updates.business_name = merchantProfile.businessName.trim();
        }
        if (merchantProfile?.contactPhone && merchantProfile.contactPhone.trim()) {
            updates.contact_phone = merchantProfile.contactPhone.trim();
        }
        if (merchantProfile?.contactEmail && merchantProfile.contactEmail.trim()) {
            updates.contact_email = merchantProfile.contactEmail.trim();
        }

        // Process doc exports
        if (eventName === "doc_exported") {
            const docType = String(properties.docType || "receipt").toLowerCase();
            const amount = Number(properties.amount) || 0;
            const currency = String(properties.currency || "NGN").toUpperCase();

            updates.total_docs_count = (currentProfile.total_docs_count || 0) + 1;
            if (docType.includes("receipt")) {
                updates.receipt_count = (currentProfile.receipt_count || 0) + 1;
            } else if (docType.includes("invoice")) {
                updates.invoice_count = (currentProfile.invoice_count || 0) + 1;
            } else if (docType.includes("order")) {
                updates.order_count = (currentProfile.order_count || 0) + 1;
            }

            if (currency === "USD") {
                updates.total_volume_usd = (Number(currentProfile.total_volume_usd) || 0) + amount;
            } else {
                updates.total_volume_ngn = (Number(currentProfile.total_volume_ngn) || 0) + amount;
            }

            // Merge top items keywords
            const existingItems: string[] = Array.isArray(currentProfile.top_items) ? currentProfile.top_items : [];
            const newItems: string[] = Array.isArray(properties.topItems) ? properties.topItems : [];
            const combinedItems = Array.from(new Set([...newItems, ...existingItems])).slice(0, 8);
            updates.top_items = combinedItems;
        }

        // Compute Marketing Tags
        const tags = new Set<string>(Array.isArray(currentProfile.feature_tags) ? currentProfile.feature_tags : []);

        if (eventName === "doc_exported") {
            const totalDocs = updates.total_docs_count || currentProfile.total_docs_count || 0;
            if (totalDocs >= 3) tags.add("Frequent Seller");
            const totalNGN = updates.total_volume_ngn || currentProfile.total_volume_ngn || 0;
            if (totalNGN >= 100000) tags.add("High Volume");
            if (updates.invoice_count >= 2) tags.add("Invoicing Focus");
        }

        if (eventName === "feature_intent") {
            const feature = properties.feature;
            if (feature === "logo_upload") tags.add("Brand Conscious");
            if (feature === "custom_color") tags.add("Design Conscious");
            if (feature === "currency_toggle") tags.add("Cross-Border");
            if (feature === "classic_template") tags.add("Premium Style Intent");
            if (feature === "whatsapp_direct") tags.add("WhatsApp Power User");
        }

        if (eventName === "upgrade_gate_viewed") {
            tags.add("Upgrade Primed");
            if (properties.variant === "logo") tags.add("Brand Conscious");
            if (properties.variant === "export") tags.add("Export Limit Hit");
        }

        if (updates.contact_phone || currentProfile.contact_phone) {
            tags.add("Has WhatsApp Phone");
        }

        updates.feature_tags = Array.from(tags);

        // Upsert shadow profile
        const profileUpsertPromise = supabaseAdmin.from("shadow_profiles").upsert(updates);

        // Run both asynchronously
        await Promise.allSettled([eventInsertPromise, profileUpsertPromise]);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[Telemetry API] Error ingesting event:", err);
        // Always return 200/ok so telemetry never breaks client experience
        return NextResponse.json({ success: true, warning: err?.message });
    }
}
