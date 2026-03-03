"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    if (session.user.role !== "admin") throw new Error("Forbidden");
    return session.user;
}

// ─── Product Actions ─────────────────────────────────────────

export async function createProduct(formData: FormData) {
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;

    if (!name || !slug) return { error: "Name and slug are required" };

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) return { error: "Slug already exists" };

    await prisma.product.create({
        data: { name, slug, type: type || "desktop", description: description || null },
    });

    revalidatePath("/admin/products");
    return { success: true };
}

export async function updateProduct(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "true";

    if (!id || !name || !slug) return { error: "Missing required fields" };

    await prisma.product.update({
        where: { id },
        data: { name, slug, type, description: description || null, isActive },
    });

    revalidatePath("/admin/products");
    return { success: true };
}

export async function deleteProduct(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;

    // Check for existing orders/licenses
    const counts = await prisma.product.findUnique({
        where: { id },
        select: {
            _count: { select: { orders: true, licenses: true } },
        },
    });

    if (counts && (counts._count.orders > 0 || counts._count.licenses > 0)) {
        return { error: "Cannot delete product with existing orders or licenses. Deactivate instead." };
    }

    // Delete plans first, then product
    await prisma.plan.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    return { success: true };
}

// ─── Plan Actions ────────────────────────────────────────────

export async function createPlan(formData: FormData) {
    await requireAdmin();

    const productId = formData.get("productId") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const priceVnd = parseInt(formData.get("priceVnd") as string);
    const priceUsd = formData.get("priceUsd") ? parseInt(formData.get("priceUsd") as string) : null;
    const durationDays = formData.get("durationDays") ? parseInt(formData.get("durationDays") as string) : null;
    const maxActivations = parseInt(formData.get("maxActivations") as string) || 1;
    const usageLimit = formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null;

    if (!productId || !name || !slug || isNaN(priceVnd)) {
        return { error: "Missing required fields" };
    }

    const existing = await prisma.plan.findUnique({
        where: { productId_slug: { productId, slug } },
    });
    if (existing) return { error: "Plan slug already exists for this product" };

    await prisma.plan.create({
        data: { productId, name, slug, priceVnd, priceUsd, durationDays, maxActivations, usageLimit },
    });

    revalidatePath("/admin/products");
    return { success: true };
}

export async function updatePlan(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const priceVnd = parseInt(formData.get("priceVnd") as string);
    const priceUsd = formData.get("priceUsd") ? parseInt(formData.get("priceUsd") as string) : null;
    const durationDays = formData.get("durationDays") ? parseInt(formData.get("durationDays") as string) : null;
    const maxActivations = parseInt(formData.get("maxActivations") as string) || 1;
    const usageLimit = formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null;
    const isActive = formData.get("isActive") === "true";

    if (!id || !name || !slug || isNaN(priceVnd)) {
        return { error: "Missing required fields" };
    }

    await prisma.plan.update({
        where: { id },
        data: { name, slug, priceVnd, priceUsd, durationDays, maxActivations, usageLimit, isActive },
    });

    revalidatePath("/admin/products");
    return { success: true };
}

export async function deletePlan(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;

    await prisma.plan.delete({ where: { id } });

    revalidatePath("/admin/products");
    return { success: true };
}
