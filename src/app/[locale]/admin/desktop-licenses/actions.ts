"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (!user || user.role !== "admin") throw new Error("Forbidden");
    return session.user;
}

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
    const maxActivations = parseInt(formData.get("maxActivations") as string) || 1;
    const usageLimit = parseInt(formData.get("usageLimit") as string) || 10;
    const expiresInDays = parseInt(formData.get("expiresInDays") as string) || 30;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await prisma.desktopLicense.create({
        data: {
            licenseKey: generateLicenseKey(),
            tier,
            maxActivations,
            usageLimit: usageLimit === -1 ? -1 : usageLimit,
            expiresAt,
        },
    });

    revalidatePath("/admin/desktop-licenses");
    return { success: true };
}

export async function updateLicense(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    const tier = formData.get("tier") as string;
    const maxActivations = parseInt(formData.get("maxActivations") as string);
    const usageLimit = parseInt(formData.get("usageLimit") as string);
    const isActive = formData.get("isActive") === "true";

    const data: Record<string, unknown> = { tier, maxActivations, usageLimit, isActive };

    const extendDays = parseInt(formData.get("extendDays") as string);
    if (extendDays > 0) {
        const license = await prisma.desktopLicense.findUnique({ where: { id } });
        const base = license?.expiresAt && license.expiresAt > new Date() ? license.expiresAt : new Date();
        const newExpiry = new Date(base);
        newExpiry.setDate(newExpiry.getDate() + extendDays);
        data.expiresAt = newExpiry;
    }

    await prisma.desktopLicense.update({ where: { id }, data });

    revalidatePath("/admin/desktop-licenses");
    return { success: true };
}

export async function resetHwid(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;

    await prisma.desktopLicense.update({
        where: { id },
        data: { hwidHash: null, currentActivations: 0 },
    });

    revalidatePath("/admin/desktop-licenses");
    return { success: true };
}

export async function deleteLicense(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;

    // Delete activation logs first
    await prisma.activationLog.deleteMany({ where: { licenseId: id } });
    await prisma.desktopLicense.delete({ where: { id } });

    revalidatePath("/admin/desktop-licenses");
    return { success: true };
}
