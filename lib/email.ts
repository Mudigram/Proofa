/**
 * Sendly API Email Service
 * Proofa Transactional & Customer Engagement Infrastructure
 *
 * Documentation: https://developer.sendlyai.com
 * Endpoint: https://api.sendlyai.com/v1/messages
 */

const SENDLY_API_URL = process.env.SENDLY_API_URL || "https://api.sendlyai.com/v1/messages";
const SENDLY_API_KEY = process.env.SENDLY_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.SENDLY_FROM_EMAIL || "Proofa <hello@proofa.ng>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Send an email using the Sendly REST API.
 * If SENDLY_API_KEY is not configured, logs the message and returns a simulated success in dev.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_FROM_EMAIL,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult> {
  const recipients = Array.isArray(to) ? to : [to];

  if (!SENDLY_API_KEY) {
    console.warn(
      "[Sendly] SENDLY_API_KEY is not set. Simulating email dispatch to:",
      recipients.join(", "),
      "Subject:",
      subject
    );
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const payload = {
      channel: "email",
      to: recipients,
      from,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ""), // Clean fallback
      ...(replyTo ? { reply_to: replyTo } : {}),
    };

    const response = await fetch(SENDLY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDLY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[Sendly] Dispatch failed:", response.status, data);
      return {
        success: false,
        error: data.message || `Sendly returned HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id || data.message_id || `msg_${Date.now()}`,
    };
  } catch (error: any) {
    console.error("[Sendly] Network exception:", error);
    return {
      success: false,
      error: error.message || "Failed to contact Sendly API",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Branded HTML Email Templates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates responsive HTML for Proofa Welcome on Signup
 */
export function getWelcomeEmailHtml({
  businessName,
  email,
}: {
  businessName?: string;
  email?: string;
}): string {
  const name = businessName || "Fellow Seller";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Proofa</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; border: 1px solid #eaeaea; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background-color: #e8590c;"></td>
          </tr>

          <!-- Header / Logo -->
          <tr>
            <td style="padding: 36px 36px 20px 36px;">
              <div style="display: inline-block; background-color: #fff4ed; border: 1px solid #fed7aa; border-radius: 14px; padding: 8px 16px;">
                <span style="font-size: 16px; font-weight: 900; color: #e8590c; letter-spacing: -0.5px;">PROOFA</span>
                <span style="font-size: 11px; font-weight: 700; color: #9a3412; margin-left: 6px; text-transform: uppercase; letter-spacing: 1px;">HQ</span>
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <h1 style="font-size: 24px; font-weight: 900; color: #111111; margin: 0 0 16px 0; letter-spacing: -0.5px; line-height: 1.25;">
                Welcome to Proofa, ${name}! 👋
              </h1>

              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Every receipt or invoice you send is a first impression. Proofa makes sure your business looks like an established, trusted brand from day one.
              </p>

              <!-- 3 Key Steps Bento Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 18px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
                      3 Quick Steps to Get Started
                    </div>

                    <!-- Step 1 -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #111111; margin-bottom: 2px;">
                        1. Save Your Bank Account in Vault 🏦
                      </div>
                      <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                        Never retype your account number again. Your bank details will automatically populate on every bill.
                      </div>
                    </div>

                    <!-- Step 2 -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #111111; margin-bottom: 2px;">
                        2. Issue a Receipt or Invoice in 30 Seconds 🧾
                      </div>
                      <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                        Select your template, add items, and preview live on your phone.
                      </div>
                    </div>

                    <!-- Step 3 -->
                    <div>
                      <div style="font-size: 14px; font-weight: 700; color: #111111; margin-bottom: 2px;">
                        3. Share Directly via WhatsApp 📲
                      </div>
                      <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                        One tap generates an HD image or PDF ready to send into your buyer's WhatsApp chat.
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://www.proofa.ng/receipt" target="_blank" style="display: block; width: 100%; max-width: 320px; background-color: #e8590c; color: #ffffff; text-decoration: none; text-align: center; padding: 16px 24px; font-size: 14px; font-weight: 800; border-radius: 16px; box-shadow: 0 4px 14px rgba(232, 89, 12, 0.35);">
                      Create Your First Receipt →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin: 0;">
                Have questions or need help setting up your brand logo? Just reply directly to this email—our founders read and respond to every note.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #fafafa; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="font-size: 11px; font-weight: 600; color: #9ca3af; margin: 0 0 6px 0;">
                Proofa HQ · The instant receipt & invoice generator for modern sellers
              </p>
              <p style="font-size: 11px; color: #d1d5db; margin: 0;">
                <a href="https://www.proofa.ng" style="color: #9ca3af; text-decoration: underline;">www.proofa.ng</a> · Lagos, Nigeria
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates responsive HTML for Plan Upgrade Confirmation (Pro & Business)
 */
export function getUpgradeEmailHtml({
  businessName,
  plan,
  amount,
  currency,
}: {
  businessName?: string;
  plan: string;
  amount: string;
  currency: string;
}): string {
  const planName = plan.toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>You're on Proofa ${planName}!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; border: 1px solid #eaeaea; overflow: hidden;">
          <tr>
            <td style="height: 6px; background-color: #e8590c;"></td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 20px 36px;">
              <div style="display: inline-block; background-color: #fff4ed; border: 1px solid #fed7aa; border-radius: 14px; padding: 8px 16px;">
                <span style="font-size: 16px; font-weight: 900; color: #e8590c;">PROOFA</span>
                <span style="font-size: 11px; font-weight: 700; color: #9a3412; margin-left: 6px;">${planName} ACTIVE</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <h1 style="font-size: 24px; font-weight: 900; color: #111111; margin: 0 0 16px 0;">
                Subscription Confirmed 🎉
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Congratulations! <strong>${businessName || "Your business"}</strong> has unlocked full access to <strong>Proofa ${planName}</strong> (${currency} ${amount}).
              </p>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 800; color: #111; margin-bottom: 10px;">What's Now Unlocked:</div>
                <div style="font-size: 13px; color: #4b5563; line-height: 1.6;">
                  ✓ Proofa Watermark Removed from all receipts and invoices<br>
                  ✓ Custom Brand Logo upload enabled<br>
                  ✓ Custom Brand Colors applied to all templates<br>
                  ✓ HD (2×) WhatsApp export enabled<br>
                  ✓ Bank Vault with multi-account storage
                </div>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://www.proofa.ng/receipt" target="_blank" style="display: block; width: 100%; max-width: 320px; background-color: #111111; color: #ffffff; text-decoration: none; text-align: center; padding: 16px 24px; font-size: 14px; font-weight: 800; border-radius: 16px;">
                      Launch Proofa Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 36px; background-color: #fafafa; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
              Proofa HQ · Thank you for powering your sales with Proofa
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates custom HTML for Admin CRM / Founder outreach
 */
export function getBroadcastEmailHtml({
  title,
  message,
  actionText,
  actionUrl,
}: {
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
}): string {
  const formattedMessage = message
    .split("\n\n")
    .map(
      (p) =>
        `<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #374151;">${p
          .trim()
          .replace(/\n/g, "<br>")}</p>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; border: 1px solid #eaeaea; overflow: hidden;">
          <tr>
            <td style="height: 6px; background-color: #e8590c;"></td>
          </tr>
          <tr>
            <td style="padding: 32px 36px 16px 36px;">
              <span style="font-size: 16px; font-weight: 900; color: #e8590c;">PROOFA</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <h1 style="font-size: 22px; font-weight: 900; color: #111111; margin: 0 0 16px 0;">
                ${title}
              </h1>
              <div style="margin-bottom: 24px;">
                ${formattedMessage}
              </div>

              ${
                actionText && actionUrl
                  ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${actionUrl}" target="_blank" style="display: block; width: 100%; max-width: 300px; background-color: #e8590c; color: #ffffff; text-decoration: none; text-align: center; padding: 14px 20px; font-size: 14px; font-weight: 800; border-radius: 14px;">
                      ${actionText}
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #fafafa; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              Proofa HQ · Lagos, Nigeria
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Convenience helper to send the welcome email
 */
export async function sendWelcomeEmail(to: string, businessName?: string) {
  const html = getWelcomeEmailHtml({ businessName, email: to });
  return await sendEmail({
    to,
    subject: `Welcome to Proofa${businessName ? `, ${businessName}` : ""}! 🧾`,
    html,
  });
}

/**
 * Convenience helper to send subscription upgrade email
 */
export async function sendUpgradeEmail(
  to: string,
  plan: string,
  amount: string,
  currency: string,
  businessName?: string
) {
  const html = getUpgradeEmailHtml({ businessName, plan, amount, currency });
  return await sendEmail({
    to,
    subject: `Your Proofa ${plan.toUpperCase()} plan is now active! 🎉`,
    html,
  });
}
