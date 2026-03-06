"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import * as LicenseService from "@/lib/services/license.service";

export async function createLicense(formData: FormData) {
    await requireAdmin();

    await LicenseService.createAdminLicense({
        tier: formData.get("tier") as string,
        productSlug: (formData.get("product") as string) || "flashcut",
        maxActivations: parseInt(formData.get("maxActivations") as string) || 1,
        usageLimit: parseInt(formData.get("usageLimit") as string) || 10,
        expiresInDays: parseInt(formData.get("expiresInDays") as string) || 30,
        email: (formData.get("email") as string) || undefined,
        contactInfo: (formData.get("contactInfo") as string) || undefined,
        note: (formData.get("note") as string) || undefined,
    });

    revalidatePath("/admin/licenses");
    return { success: true };
}

export async function updateLicense(formData: FormData) {
    await requireAdmin();

    await LicenseService.updateLicense(formData.get("id") as string, {
        tier: formData.get("tier") as string,
        maxActivations: parseInt(formData.get("maxActivations") as string),
        usageLimit: parseInt(formData.get("usageLimit") as string),
        status: formData.get("isActive") === "true" ? "active" : "revoked",
        email: (formData.get("email") as string) || null,
        contactInfo: (formData.get("contactInfo") as string) || null,
        note: (formData.get("note") as string) || null,
        extendDays: parseInt(formData.get("extendDays") as string),
    });

    revalidatePath("/admin/licenses");
    return { success: true };
}

export async function resetHwid(formData: FormData) {
    await requireAdmin();
    await LicenseService.resetHwid(formData.get("id") as string);
    revalidatePath("/admin/licenses");
    return { success: true };
}

export async function deleteLicense(formData: FormData) {
    await requireAdmin();
    await LicenseService.deleteLicense(formData.get("id") as string);
    revalidatePath("/admin/licenses");
    return { success: true };
}
