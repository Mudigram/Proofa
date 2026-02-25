/**
 * ExportUtils.ts
 * Uses html-to-image instead of html2canvas.
 * html-to-image renders via SVG foreignObject, which delegates all CSS
 * parsing to the browser itself — so oklab/oklch, container queries,
 * and every other modern CSS feature just works.
 *
 * Install: npm install html-to-image
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Clones a node, strips transforms on it and all its ancestors,
 * and returns { clone, cleanup }.
 * We render this clean clone off-screen so the captured image is never
 * affected by any scale()/translate() on the visual preview wrapper.
 */
const buildCleanClone = (root: HTMLElement): { clone: HTMLElement; container: HTMLDivElement; cleanup: () => void } => {
    const container = document.createElement("div");

    // Position off-screen, not display:none — html-to-image needs it painted
    Object.assign(container.style, {
        position: "fixed",
        top: "0",
        left: "-99999px",
        width: `${root.scrollWidth}px`,
        zIndex: "-1",
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

export const captureElementAsImage = async (elementId: string): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    const root = document.getElementById(elementId);
    if (!root) {
        console.error(`[Export] Element #${elementId} not found`);
        return null;
    }

    const oldScrollY = window.scrollY;
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 80));

    console.log(`[Export] Capturing element: ${root.scrollWidth}x${root.scrollHeight}`);

    // Build a transform-free off-screen clone so any scale() on the
    // visual preview wrapper doesn't affect the exported image
    const { clone, cleanup } = buildCleanClone(root);

    try {
        // Dynamically import html-to-image (tree-shakes unused formats)
        const { toPng } = await import("html-to-image");

        const dataUrl = await toPng(clone, {
            pixelRatio: 2,
            backgroundColor: "#ffffff",
            // Skip external/cross-origin nodes that can't be inlined
            filter: (node) => {
                if (node instanceof HTMLElement) {
                    // Don't try to inline cross-origin iframes
                    if (node.tagName === "IFRAME") return false;
                }
                return true;
            },
        });

        window.scrollTo(0, oldScrollY);
        return dataUrl;

    } catch (error) {
        console.error("[Export] Capture failed:", error);
        return null;
    } finally {
        cleanup();
    }
};

// ─── PDF export ───────────────────────────────────────────────────────────────

export const downloadAsPDF = async (elementId: string, filename: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    try {
        const jspdfModule = await import("jspdf");
        const jsPDF = jspdfModule.jsPDF || (jspdfModule as any).default;

        const dataUrl = await captureElementAsImage(elementId);
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

// ─── Image download ───────────────────────────────────────────────────────────

export const downloadImage = async (dataUrl: string, filename: string): Promise<void> => {
    if (typeof window === "undefined") return;

    try {
        const [meta, b64] = dataUrl.split(",");
        const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const blob = new Blob([bytes], { type: mime });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            if (document.body.contains(a)) document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2000);

        console.log("[Export] Download triggered successfully.");
    } catch (e) {
        console.error("[Export] Download failed:", e);
        window.open(dataUrl, "_blank");
    }
};