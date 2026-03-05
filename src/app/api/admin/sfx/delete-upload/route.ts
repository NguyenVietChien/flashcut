import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

/**
 * Delete an orphaned Cloudinary upload (when user cancels SFX dialog).
 * Uses Cloudinary Admin API with signed request.
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { cloudinaryUrl } = await req.json();
        if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") {
            return NextResponse.json({ error: "cloudinaryUrl is required" }, { status: 400 });
        }

        const {
            CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET,
        } = process.env;

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            // If no API credentials configured, silently skip deletion
            return NextResponse.json({ ok: true, skipped: true });
        }

        // Extract public_id from Cloudinary URL
        // e.g. https://res.cloudinary.com/xxx/video/upload/v123/flashcut-sfx/filename.mp3
        const urlObj = new URL(cloudinaryUrl);
        const pathParts = urlObj.pathname.split("/upload/");
        if (pathParts.length < 2) {
            return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
        }
        // Remove version prefix (v123/) and file extension
        const afterUpload = pathParts[1].replace(/^v\d+\//, "");
        const publicId = afterUpload.replace(/\.[^/.]+$/, "");

        // Sign the destroy request
        const timestamp = Math.floor(Date.now() / 1000);
        const toSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
        const signature = crypto.createHash("sha1").update(toSign).digest("hex");

        const form = new FormData();
        form.append("public_id", publicId);
        form.append("timestamp", timestamp.toString());
        form.append("api_key", CLOUDINARY_API_KEY);
        form.append("signature", signature);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/destroy`,
            { method: "POST", body: form }
        );

        const data = await res.json();

        return NextResponse.json({ ok: true, result: data.result });
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
