"use server";

import { turso } from "@/lib/turso";
import { upsertSfxVector, deleteSfxVector } from "@/lib/pinecone";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";

function generateId(): string {
    return `sfx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function createSfx(formData: FormData) {
    await requireAdmin();

    const name = formData.get("name") as string;
    const filename = formData.get("filename") as string;
    const cloudinaryUrl = formData.get("cloudinaryUrl") as string;
    const durationSec = formData.get("durationSec") ? parseFloat(formData.get("durationSec") as string) : null;
    const fileSizeBytes = formData.get("fileSizeBytes") ? parseInt(formData.get("fileSizeBytes") as string) : null;
    const category = formData.get("category") as string || null;
    const subcategory = formData.get("subcategory") as string || null;
    const mood = formData.get("mood") as string || null;
    const intensity = formData.get("intensity") as string || null;
    const tags = formData.get("tags") as string || null;
    const description = formData.get("description") as string || null;
    const useCases = formData.get("useCases") as string || null;
    const isLoop = formData.get("isLoop") === "true" ? 1 : 0;

    if (!name || !filename || !cloudinaryUrl) {
        return { error: "Name, filename, and audio URL are required" };
    }

    const id = generateId();

    await turso.execute({
        sql: `INSERT INTO sfx_library (id, name, filename, cloudinary_url, duration_sec, file_size_bytes, category, subcategory, mood, intensity, tags, description, use_cases, is_loop)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, name, filename, cloudinaryUrl, durationSec, fileSizeBytes, category, subcategory, mood, intensity, tags, description, useCases, isLoop],
    });

    // Fire-and-forget: sync to Pinecone
    upsertSfxVector({ id, name, category, subcategory, mood, intensity, tags, description, useCases });

    revalidatePath("/admin/sfx");
    return { success: true, id };
}

export async function updateSfx(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string || null;
    const subcategory = formData.get("subcategory") as string || null;
    const mood = formData.get("mood") as string || null;
    const intensity = formData.get("intensity") as string || null;
    const tags = formData.get("tags") as string || null;
    const description = formData.get("description") as string || null;
    const useCases = formData.get("useCases") as string || null;
    const isLoop = formData.get("isLoop") === "true" ? 1 : 0;

    if (!id || !name) return { error: "Missing required fields" };

    await turso.execute({
        sql: `UPDATE sfx_library SET name = ?, category = ?, subcategory = ?, mood = ?, intensity = ?, tags = ?, description = ?, use_cases = ?, is_loop = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [name, category, subcategory, mood, intensity, tags, description, useCases, isLoop, id],
    });

    // Fire-and-forget: re-sync to Pinecone
    upsertSfxVector({ id, name, category, subcategory, mood, intensity, tags, description, useCases });

    revalidatePath("/admin/sfx");
    return { success: true };
}

export async function deleteSfx(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    if (!id) return { error: "Missing ID" };

    await turso.execute({ sql: "DELETE FROM sfx_library WHERE id = ?", args: [id] });

    // Fire-and-forget: remove from Pinecone
    deleteSfxVector(id);

    revalidatePath("/admin/sfx");
    return { success: true };
}

