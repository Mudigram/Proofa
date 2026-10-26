import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, businessName } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email provided" },
        { status: 400 }
      );
    }

    const result = await sendWelcomeEmail(email.trim(), businessName?.trim());

    if (!result.success) {
      console.warn("[Welcome Email API] Sendly dispatch notice:", result.error);
      return NextResponse.json(
        { success: false, error: result.error, simulated: result.simulated },
        { status: 200 } // Don't block client signup UX on email failures
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      simulated: result.simulated,
    });
  } catch (error: any) {
    console.error("[Welcome Email API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
