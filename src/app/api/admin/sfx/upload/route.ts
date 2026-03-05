import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/x-wav"];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
            return NextResponse.json({ error: "Invalid file type. Use MP3, WAV, or OGG." }, { status: 400 });
        }

        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
        }

        const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_SFX_UPLOAD_PRESET } = process.env;
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_SFX_UPLOAD_PRESET) {
            return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
        }

        const cloudinaryForm = new FormData();
        cloudinaryForm.append("file", file);
        cloudinaryForm.append("upload_preset", CLOUDINARY_SFX_UPLOAD_PRESET);
        cloudinaryForm.append("folder", "flashcut-sfx");
        cloudinaryForm.append("resource_type", "auto");

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            { method: "POST", body: cloudinaryForm }
        );

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: errData.error?.message || "Cloudinary upload failed" },
                { status: 500 }
            );
        }

        const data = await res.json();

        return NextResponse.json({
            url: data.secure_url,
            filename: file.name,
            bytes: data.bytes,
            duration: data.duration || null,
        });
    } catch (error) {
        console.error("SFX upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
