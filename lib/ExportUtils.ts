/**
 * ExportUtils.ts
 * Uses html-to-image instead of html2canvas.
 * html-to-image renders via SVG foreignObject, which delegates all CSS
 * parsing to the browser itself — so oklab/oklch, container queries,
 * and every other modern CSS feature just works.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Clones a node, strips transforms on it and all its ancestors,
 * and returns { clone, cleanup }.
 * Rendered within viewport bounds (top: 0, left: 0, opacity: 0) instead of
 * large negative offsets (-99999px), which break iOS WebKit tiling and SVG foreignObject.
 */
const buildCleanClone = (root: HTMLElement): { clone: HTMLElement; container: HTMLDivElement; cleanup: () => void } => {
    const container = document.createElement("div");
    const targetWidth = Math.max(root.offsetWidth || root.scrollWidth || 440, 360);

    // Keep within normal coordinate space but completely invisible
    Object.assign(container.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: `${targetWidth}px`,
        zIndex: "-9999",
        opacity: "0",
        pointerEvents: "none",
        overflow: "visible",
    });

    const clone = root.cloneNode(true) as HTMLElement;

    // Reset any transforms / overflow on the clone itself
    Object.assign(clone.style, {
        transform: "none",
        scale: "unset",
        overflow: "visible",
        position: "relative",
        margin: "0",
        width: "100%",
        maxWidth: `${targetWidth}px`,
        height: "auto",
        maxHeight: "none",
    });

    container.appendChild(clone);
    document.body.appendChild(container);

    const cleanup = () => {
        if (document.body.contains(container)) document.body.removeChild(container);
    };

    return { clone, container, cleanup };
};

// ─── Core capture ─────────────────────────────────────────────────────────────

/**
 * Utility to wait for all images inside an element to be fully loaded.
 * Strict 500ms safety timeout guarantees it NEVER hangs execution on iOS WebKit.
 */
const waitForImages = async (element: HTMLElement) => {
    const images = Array.from(element.getElementsByTagName("img"));
    const promises = images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue anyway on error
        });
    });

    await Promise.race([
        Promise.all(promises),
        new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
};

export const captureElementAsImage = async (elementId: string, isHD: boolean = false): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    const root = document.getElementById(elementId);
    if (!root) {
        console.error(`[Export] Element #${elementId} not found`);
        return null;
    }

    const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent || "");

    const oldScrollY = window.scrollY;
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 60));

    // Build a transform-free clone within viewport bounds but invisible
    const { clone, cleanup } = buildCleanClone(root);

    try {
        const { toPng } = await import("html-to-image");

        // 1. Wait for images with strict 500ms timeout
        await waitForImages(clone);

        // Cap pixelRatio on iOS devices to prevent WebKit memory exhaustion crashes
        const safePixelRatio = isIOS ? (isHD ? 2 : 1.5) : (isHD ? 3 : 2);

        // 2. Perform capture wrapped in a 5-second timeout safeguard
        const capturePromise = toPng(clone, {
            pixelRatio: safePixelRatio,
            backgroundColor: "#ffffff",
            cacheBust: true,
            skipFonts: true, // Avoids cross-origin font fetch hangs in iOS WebKit foreignObject
            filter: (node) => {
                if (node instanceof HTMLElement) {
                    if (node.tagName === "IFRAME") return false;
                }
                return true;
            },
        });

        const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Capture timed out after 5s")), 5000)
        );

        const dataUrl = await Promise.race([capturePromise, timeoutPromise]);

        window.scrollTo(0, oldScrollY);
        return dataUrl;
    } catch (error) {
        console.error("[Export] Capture failed or timed out:", error);
        return null;
    } finally {
        cleanup();
    }
};

// ─── PDF export ───────────────────────────────────────────────────────────────

export const downloadAsPDF = async (elementId: string, filename: string, isHD: boolean = false): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    try {
        const jspdfModule = await import("jspdf");
        const jsPDF = jspdfModule.jsPDF || (jspdfModule as any).default;

        const dataUrl = await captureElementAsImage(elementId, isHD);
        if (!dataUrl) return false;

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => (img.onload = resolve));

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (img.height * imgWidth) / img.width;

        const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [imgWidth, imgHeight] });
        pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
        pdf.save(filename);
        return true;
    } catch (error) {
        console.error("[Export] PDF generation failed:", error);
        return false;
    }
};

// ─── Direct image download ───────────────────────────────────────────────────

export const downloadImage = (dataUrl: string, filename: string): void => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.contains(a) && document.body.removeChild(a), 1500);
};
