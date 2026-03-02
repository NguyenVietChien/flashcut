import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        return NextResponse.json(
            { error: "Cloudinary not configured" },
            { status: 500 }
        );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
            { error: "Invalid file type. Allowed: PNG, JPG, WEBP, GIF" },
            { status: 400 }
        );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
            { error: "File too large. Max 5MB" },
            { status: 400 }
        );
    }

    // Upload to Cloudinary via unsigned upload
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    cloudinaryForm.append("folder", "flashcut-blog");

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: cloudinaryForm }
    );

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(
            { error: data.error?.message || "Upload failed" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        url: data.secure_url,
        fileName: data.public_id,
    });
}
