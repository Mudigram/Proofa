import { NextResponse } from "next/server";
import { sendEmail, getBroadcastEmailHtml } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const adminKey = req.headers.get("x-admin-key") || body.adminKey;
    const validKey = process.env.ADMIN_SECRET_KEY || "proofa_hq_2026";

    if (!adminKey || adminKey.trim() !== validKey.trim()) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid admin key" },
        { status: 401 }
      );
    }

    const { to, subject, message, actionText, actionUrl } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, or message" },
        { status: 400 }
      );
    }

    const html = getBroadcastEmailHtml({
      title: subject,
      message,
      actionText,
      actionUrl,
    });

    const result = await sendEmail({
      to,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      simulated: result.simulated,
    });
  } catch (error: any) {
    console.error("[Admin Email API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
