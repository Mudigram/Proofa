/**
 * ShareUtils.ts
 *
 * THE CORE PWA PROBLEM:
 * iOS Safari requires navigator.share() to be called synchronously within
 * a user gesture handler. Any await before the call (fetch, canvas ops, etc.)
 * breaks the gesture chain and iOS silently drops the files, sharing text only.
 *
 * SOLUTION — two-phase approach:
 *   Phase 1 (background): As soon as the preview renders, we silently capture
 *   the image and convert it to a File object. This runs outside any gesture.
 *
 *   Phase 2 (on tap): The button handler uses the pre-built File directly.
 *   navigator.share({ files }) is called with ZERO async work before it.
 *   iOS keeps the gesture context → files go through → image lands in WhatsApp.
 */

export type ShareResult = "shared" | "downloaded" | "aborted" | "error";

// ─── File conversion ──────────────────────────────────────────────────────────

export const dataUrlToFile = async (
    dataUrl: string,
    filename: string
): Promise<File | null> => {
    try {
        // Use fetch + blob — most reliable cross-browser way
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: "image/png" });
    } catch (e) {
        console.error("[Share] dataUrl → File failed:", e);
        return null;
    }
};

// ─── Capability checks ────────────────────────────────────────────────────────

export const canShareFiles = (files: File[]): boolean => {
    if (typeof navigator === "undefined") return false;
    if (!navigator.share || !navigator.canShare) return false;
    try {
        return navigator.canShare({ files });
    } catch {
        return false;
    }
};

// ─── Pre-bake (call this in background, before user taps) ────────────────────

export const prebakeShareFile = async (
    dataUrl: string,
    filename: string
): Promise<File | null> => dataUrlToFile(dataUrl, filename);

// ─── Download fallback ────────────────────────────────────────────────────────

const triggerDownload = (dataUrl: string, filename: string): void => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.contains(a) && document.body.removeChild(a), 1500);
};

// ─── Core share ───────────────────────────────────────────────────────────────

export interface ShareOptions {
    /** Raw PNG data URL — used as fallback if prebaked file is missing */
    dataUrl: string;
    docType: string;
    filename: string;
    /**
     * Pre-built File object from prebakeShareFile().
     * When provided and valid, navigator.share() is called with ZERO awaits
     * before it — preserving iOS gesture context so files actually go through.
     */
    prebaked?: File | null;
    /**
     * Merchant shadowId for attribution loop. When present, appends
     * ?src=receipt&sid=<shadowId>&dt=<docType> to the share URL.
     */
    shadowId?: string | null;
    /** Override default message body */
    customText?: string;
}

/**
 * Attempts to share the invoice image via the native share sheet.
 *
 * Priority:
 *  1. Use prebaked File → navigator.share({ files }) → image in share sheet ✅
 *  2. No prebaked but canShareFiles → build file now → share (works Android,
 *     may fail iOS due to gesture timeout)
 *  3. No file share support → download image + show instruction toast
 */
const attemptShare = async (opts: ShareOptions, title: string, text: string): Promise<ShareResult> => {
    const { dataUrl, filename, prebaked } = opts;

    // Fast path: use pre-built file with no async work (iOS-safe)
    if (prebaked && canShareFiles([prebaked])) {
        try {
            await navigator.share({ files: [prebaked], title, text });
            return "shared";
        } catch (err: any) {
            if (err.name === "AbortError") return "aborted";
            console.warn("[Share] navigator.share with prebaked file failed:", err.message);
            // Don't fall through to rebuild — just download
            triggerDownload(dataUrl, filename);
            return "downloaded";
        }
    }

    // Slow path: build file now (async — may break iOS gesture)
    const file = await dataUrlToFile(dataUrl, filename);
    if (file && canShareFiles([file])) {
        try {
            await navigator.share({ files: [file], title, text });
            return "shared";
        } catch (err: any) {
            if (err.name === "AbortError") return "aborted";
            console.warn("[Share] navigator.share (slow path) failed:", err.message);
        }
    }

    // Fallback: download only — never silently send text
    triggerDownload(dataUrl, filename);
    return "downloaded";
};

export const shareToWhatsApp = (opts: ShareOptions): Promise<ShareResult> => {
    const referralQuery = opts.shadowId
        ? `?src=receipt&sid=${encodeURIComponent(opts.shadowId)}&dt=${encodeURIComponent(opts.docType)}`
        : "";
    const defaultText = `Here is your ${opts.docType} 🧾\n_Sent via Proofa — https://proofa.ng${referralQuery}_`;

    return attemptShare(
        opts,
        `Proofa ${opts.docType}`,
        opts.customText || defaultText
    );
};

export const shareViaWebShare = (opts: ShareOptions): Promise<ShareResult> =>
    attemptShare(
        opts,
        `Proofa ${opts.docType}`,
        `Here is your ${opts.docType} from Proofa 🧾`
    );