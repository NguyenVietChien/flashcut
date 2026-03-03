"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { requireAdmin } from "@/lib/admin-guard";


function generateLicenseKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segments = [];
    for (let i = 0; i < 4; i++) {
        let seg = "";
        for (let j = 0; j < 5; j++) {
            seg += chars[crypto.randomInt(chars.length)];
        }
        segments.push(seg);
    }
    return segments.join("-");
}

export async function createLicense(formData: FormData) {
    await requireAdmin();

    const tier = formData.get("tier") as string;
    const productSlug = (formData.get("product") as string) || "flashcut";
    const maxActivations = parseInt(formData.get("maxActivations") as string) || 1;
    const usageLimit = parseInt(formData.get("usageLimit") as string) || 10;
    const expiresInDays = parseInt(formData.get("expiresInDays") as string) || 30;
    const email = formData.get("email") as string || undefined;
    const contactInfo = formData.get("contactInfo") as string || undefined;
    const note = formData.get("note") as string || undefined;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Find product
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });

    await prisma.license.create({
        data: {
            key: generateLicenseKey(),
            plan: tier,
            tier,
            maxActivations,
            usageLimit: usageLimit === -1 ? null : usageLimit,
            expiresAt,
            source: "admin",
            email: email || null,
            contactInfo: contactInfo || null,
            note: note || null,
            productId: product?.id || null,
        },
    });

    revalidatePath("/admin/licenses");
    return { success: true };
}

export async function updateLicense(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    const tier = formData.get("tier") as string;
    const maxActivations = parseInt(formData.get("maxActivations") as string);
    const usageLimit = parseInt(formData.get("usageLimit") as string);
    const status = formData.get("status") as string || "active";
    const email = formData.get("email") as string || null;
    const contactInfo = formData.get("contactInfo") as string || null;
    const note = formData.get("note") as string || null;

    const data: Record<string, unknown> = {
        tier, plan: tier, maxActivations,
        usageLimit: usageLimit === -1 ? null : usageLimit,
        status, email, contactInfo, note,
    };

    const extendDays = parseInt(formData.get("extendDays") as string);
    if (extendDays > 0) {
        const license = await prisma.license.findUnique({ where: { id } });
        const base = license?.expiresAt && license.expiresAt > new Date() ? license.expiresAt : new Date();
        const newExpiry = new Date(base);
        newExpiry.setDate(newExpiry.getDate() + extendDays);
        data.expiresAt = newExpiry;
    }

    await prisma.license.update({ where: { id }, data });

    revalidatePath("/admin/licenses");
    return { success: true };
}

export async function resetHwid(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;

    await prisma.license.update({
        where: { id },
        data: { hwidHash: null, currentActivations: 0 },
    });

    revalidatePath("/admin/licenses");
    return { success: true };
}

export async function deleteLicense(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;

    // Delete activation logs first
    await prisma.activationLog.deleteMany({ where: { licenseId: id } });
    await prisma.license.delete({ where: { id } });

    revalidatePath("/admin/licenses");
    return { success: true };
}
