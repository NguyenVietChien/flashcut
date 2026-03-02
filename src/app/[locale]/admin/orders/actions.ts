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

export async function updateOrderStatus(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    if (!["pending", "paid", "cancelled", "refunded"].includes(status)) {
        return { error: "Invalid status" };
    }

    const data: Record<string, unknown> = { status };

    if (status === "paid") {
        data.paidAt = new Date();
    }

    await prisma.order.update({ where: { id }, data });

    revalidatePath("/admin/orders");
    return { success: true };
}

export async function deleteOrder(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;

    // Delete associated license first
    await prisma.license.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    revalidatePath("/admin/orders");
    return { success: true };
}
