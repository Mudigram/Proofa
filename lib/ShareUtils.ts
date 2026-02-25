/**
 * ShareUtils.ts
 *
 * WhatsApp sharing strategy:
 *
 *  Mobile (Android/iOS) — navigator.share({ files }) is supported and
 *  WhatsApp registers itself as a share target. The image lands directly
 *  in the user's WhatsApp share sheet. Best experience.
 *
 *  Desktop Chrome / unsupported — Web Share API either doesn't exist or
 *  doesn't support files. We download the image and open WhatsApp Web
 *  so the user can attach it manually. We show a clear toast explaining this.
 *
 *  User cancelled share sheet — navigator.share throws AbortError.
 *  We treat this silently (no error toast).
 */

export type ShareResult =
    | "shared"        // Web Share API succeeded
    | "downloaded"    // Fallback: image downloaded + WhatsApp Web opened
    | "aborted"       // User dismissed the share sheet
    | "error";        // Something unexpected went wrong

// ─── Core primitive: convert dataUrl → File ───────────────────────────────────

export const dataUrlToFile = async (
    dataUrl: string,
    filename: string
): Promise<File | null> => {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: "image/png" });
    } catch (e) {
        console.error("[Share] dataUrl → File failed:", e);
        return null;
    }
};

// ─── Check capabilities ───────────────────────────────────────────────────────

/**
 * Returns true if this browser can share files natively (mobile Chrome/Safari).
 * Always do a canShare() probe — some browsers have navigator.share but not file sharing.
 */
export const canShareFiles = (files: File[]): boolean => {
    if (typeof navigator === "undefined") return false;
    if (!navigator.share) return false;
    if (!navigator.canShare) return false;
    return navigator.canShare({ files });
};

// ─── WhatsApp text link (desktop fallback) ────────────────────────────────────

/**
 * Opens WhatsApp Web / app with a pre-filled message.
 * On mobile this deep-links into the app; on desktop it opens WhatsApp Web.
 */
const openWhatsAppWithText = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
};

// ─── Download helper ──────────────────────────────────────────────────────────

const triggerDownload = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
    }, 1000);
};

// ─── Main share function ──────────────────────────────────────────────────────

export interface WhatsAppShareOptions {
    /** PNG data URL from captureElementAsImage */
    dataUrl: string;
    /** e.g. "invoice", "receipt", "order" */
    docType: string;
    /** Used for the downloaded filename, e.g. "Proofa-invoice-123.png" */
    filename: string;
    /** Optional custom message. Defaults to a sensible Proofa message. */
    message?: string;
}

/**
 * The single entry point for all WhatsApp sharing.
 *
 * Returns a ShareResult so the caller can show the right toast:
 *   "shared"     → "Sent to WhatsApp!"
 *   "downloaded" → "Image saved — attach it in WhatsApp"
 *   "aborted"    → (show nothing or a soft message)
 *   "error"      → "Something went wrong"
 */
export const shareToWhatsApp = async (
    opts: WhatsAppShareOptions
): Promise<ShareResult> => {
    const { dataUrl, docType, filename, message } = opts;

    const defaultMessage =
        `Here is your ${docType} from Proofa 🧾\n` +
        `_Generated with Proofa — proofa.app_`;

    const shareText = message ?? defaultMessage;

    // ── Path 1: Mobile with file sharing support ──────────────────────────────
    const file = await dataUrlToFile(dataUrl, filename);

    if (file && canShareFiles([file])) {
        try {
            await navigator.share({
                files: [file],
                // Note: WhatsApp ignores title/text when files are present,
                // but other apps (Telegram, Gmail) use them.
                title: `Proofa ${docType}`,
                text: shareText,
            });
            return "shared";
        } catch (err: any) {
            if (err.name === "AbortError") return "aborted";
            // Share failed for another reason — fall through to download fallback
            console.warn("[Share] navigator.share failed, falling back:", err);
        }
    }

    // ── Path 2: Desktop / no file-share support ───────────────────────────────
    // Download the image and open WhatsApp Web so user can attach manually.
    triggerDownload(dataUrl, filename);

    // Small delay so the download starts before the new tab opens
    await new Promise((r) => setTimeout(r, 300));

    openWhatsAppWithText(
        `${shareText}\n\n` +
        `_(Your invoice image has been saved — tap the 📎 attach button in WhatsApp to send it)_`
    );

    return "downloaded";
};

// ─── Generic Web Share (non-WhatsApp) ────────────────────────────────────────

export interface GenericShareOptions {
    dataUrl: string;
    docType: string;
    filename: string;
}

/**
 * Uses the generic Web Share API sheet (not WhatsApp-specific).
 * User picks the app from their system share sheet.
 */
export const shareViaWebShare = async (
    opts: GenericShareOptions
): Promise<ShareResult> => {
    const { dataUrl, docType, filename } = opts;

    const file = await dataUrlToFile(dataUrl, filename);
    if (!file) return "error";

    if (!canShareFiles([file])) {
        // No Web Share support — just download
        triggerDownload(dataUrl, filename);
        return "downloaded";
    }

    try {
        await navigator.share({
            title: `Proofa ${docType}`,
            text: `Here is your ${docType} from Proofa 🧾`,
            files: [file],
        });
        return "shared";
    } catch (err: any) {
        if (err.name === "AbortError") return "aborted";
        console.error("[Share] Generic share failed:", err);
        return "error";
    }
};