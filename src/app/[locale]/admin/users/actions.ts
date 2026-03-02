"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function updateUserRole(formData: FormData) {
    const admin = await requireAdmin();
    const id = formData.get("id") as string;
    const role = formData.get("role") as string;

    // Prevent admin from changing own role
    if (id === admin.id) {
        return { error: "Cannot change your own role" };
    }

    if (!["user", "admin"].includes(role)) {
        return { error: "Invalid role" };
    }

    await prisma.user.update({
        where: { id },
        data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(formData: FormData) {
    const admin = await requireAdmin();
    const id = formData.get("id") as string;

    // Prevent admin from deleting self
    if (id === admin.id) {
        return { error: "Cannot delete your own account" };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/users");
    return { success: true };
}
