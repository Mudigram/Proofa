import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";
import { InboundEmail } from "@/app/api/email/inbound/route";
import { requireAdmin } from "@/lib/admin-auth";

const INBOUND_FILE_PATH = path.join(process.cwd(), ".next", "cache", "inbound_emails.json");

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    let emails: InboundEmail[] = [];

    // 1. Try fetching from Supabase table `inbound_emails`
    try {
      const { data, error } = await supabaseAdmin
        .from("inbound_emails")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data) && data.length > 0) {
        emails = data.map((d: any) => ({
          id: d.id,
          from: d.sender,
          to: d.recipient || "hello@proofa.ng",
          subject: d.subject || "No subject",
          text: d.body_text || "",
          html: d.body_html || undefined,
          receivedAt: d.created_at,
          read: true,
        }));
      }
    } catch (e) {
      console.warn("[Admin Inbox API] Supabase fetch fallback:", e);
    }

    // 2. If no DB records yet, check local cache file
    if (emails.length === 0 && fs.existsSync(INBOUND_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(INBOUND_FILE_PATH, "utf8");
        emails = JSON.parse(raw);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      inbox: emails,
      webhookEndpoint: "https://www.proofa.ng/api/email/inbound",
      monitoredAddress: "hello@proofa.ng",
    });
  } catch (error: any) {
    console.error("[Admin Inbox API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
