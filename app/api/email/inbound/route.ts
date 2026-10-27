import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export interface InboundEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  receivedAt: string;
  read: boolean;
}

const INBOUND_FILE_PATH = path.join(process.cwd(), ".next", "cache", "inbound_emails.json");

// Local fallback store helper
function saveLocalInbound(email: InboundEmail) {
  try {
    const dir = path.dirname(INBOUND_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let existing: InboundEmail[] = [];
    if (fs.existsSync(INBOUND_FILE_PATH)) {
      existing = JSON.parse(fs.readFileSync(INBOUND_FILE_PATH, "utf8"));
    }
    existing.unshift(email);
    // Keep last 100 emails locally
    if (existing.length > 100) existing = existing.slice(0, 100);
    fs.writeFileSync(INBOUND_FILE_PATH, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.warn("[Inbound Email] Local store notice:", err);
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));

    // Parse various inbound webhook formats (Sendly, SendGrid, Postmark, Mailgun)
    const sender =
      raw.from ||
      raw.sender ||
      raw.from_email ||
      raw.data?.from ||
      raw.data?.sender ||
      "unknown@sender.com";

    const recipient =
      raw.to ||
      raw.recipient ||
      raw.data?.to ||
      "hello@proofa.ng";

    const subject =
      raw.subject ||
      raw.data?.subject ||
      "No subject";

    const text =
      raw.text ||
      raw.body ||
      raw.message ||
      raw.data?.text ||
      raw.data?.body ||
      (typeof raw.html === "string" ? raw.html.replace(/<[^>]*>?/gm, "") : "Empty message body");

    const html = raw.html || raw.data?.html;

    const emailRecord: InboundEmail = {
      id: raw.id || `inbound_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      from: typeof sender === "object" ? sender.email || JSON.stringify(sender) : String(sender),
      to: typeof recipient === "object" ? recipient.email || JSON.stringify(recipient) : String(recipient),
      subject: String(subject),
      text: String(text),
      html: typeof html === "string" ? html : undefined,
      receivedAt: new Date().toISOString(),
      read: false,
    };

    console.log(`[Inbound Email API] Received email from: ${emailRecord.from} | Subject: ${emailRecord.subject}`);

    // 1. Attempt storing in Supabase `inbound_emails` table
    try {
      await supabaseAdmin.from("inbound_emails").insert([
        {
          id: emailRecord.id,
          sender: emailRecord.from,
          recipient: emailRecord.to,
          subject: emailRecord.subject,
          body_text: emailRecord.text,
          body_html: emailRecord.html,
          created_at: emailRecord.receivedAt,
        },
      ]);
    } catch (dbErr) {
      console.warn("[Inbound Email API] Supabase table insert notice (falling back to cache):", dbErr);
    }

    // 2. Always persist to resilient local fallback cache
    saveLocalInbound(emailRecord);

    return NextResponse.json({ success: true, id: emailRecord.id });
  } catch (error: any) {
    console.error("[Inbound Email API] Error handling incoming mail:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
