import { NextResponse } from "next/server";
import { sendEmail, getBroadcastEmailHtml } from "@/lib/email";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

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

    const recipients = Array.isArray(to) ? to : [to];

    // Individual dispatch protects customer privacy (no exposed group CC headers)
    if (recipients.length > 1) {
      const results = [];
      for (const recipient of recipients) {
        const cleanEmail = recipient.trim();
        if (!cleanEmail || !cleanEmail.includes("@")) continue;
        const res = await sendEmail({
          to: cleanEmail,
          subject,
          html,
        });
        results.push(res);
      }
      return NextResponse.json({
        success: true,
        sentCount: results.filter((r) => r.success).length,
        total: recipients.length,
      });
    }

    const result = await sendEmail({
      to: recipients[0].trim(),
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
