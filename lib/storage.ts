import { supabase } from "./supabase";

/**
 * Uploads a base64 or File logo to Supabase Storage.
 * Stores it in the 'logos' bucket under a folder named by the userId.
 */
export async function uploadLogo(userId: string, file: File | string): Promise<{ url: string | null; error: string | null }> {
    try {
        const bucket = "logos";
        const fileExt = "png"; // Standardizing on png for logos
        const fileName = `${userId}/logo-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        let body: any;
        if (typeof file === "string") {
            // Convert base64 to Blob
            const base64Data = file.split(",")[1];
            const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
            body = blob;
        } else {
            body = file;
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, body, {
                upsert: true,
                contentType: "image/png"
            });

        if (uploadError) {
            return { url: null, error: uploadError.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        // Ensure the URL is absolute and correctly formatted
        // Sometimes library versions return relative paths or missing domains
        let finalUrl = publicUrl;
        if (!finalUrl.startsWith("http")) {
            const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
            finalUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
        }

        return { url: finalUrl, error: null };
    } catch (err: any) {
        return { url: null, error: err.message };
    }
}

/**
 * Deletes an old logo from storage if a new one is uploaded.
 */
export async function deleteLogo(url: string): Promise<void> {
    try {
        const bucket = "logos";
        // Extract path from public URL
        // Example URL: https://xyz.supabase.co/storage/v1/object/public/logos/user_id/logo-123.png
        const parts = url.split(`${bucket}/`);
        if (parts.length < 2) return;

        const path = parts[1];
        await supabase.storage.from(bucket).remove([path]);
    } catch (err) {
        console.error("Failed to delete old logo:", err);
    }
}
