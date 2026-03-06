"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { generateOrderCode, buildSepayQrUrl, SEPAY_CONFIG } from "@/lib/sepay";


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

export async function createAdminOrder(formData: FormData) {
    await requireAdmin();

    const planSlug = formData.get("plan") as string;
    const buyerEmail = (formData.get("buyerEmail") as string) || null;

    const plan = await prisma.plan.findFirst({
        where: { slug: planSlug, isActive: true },
        select: { name: true, priceVnd: true, productId: true },
    });

    if (!plan) {
        return { error: "Plan not found" };
    }

    const orderCode = generateOrderCode();

    const order = await prisma.order.create({
        data: {
            productId: plan.productId,
            buyerEmail,
            source: "admin",
            plan: planSlug,
            amount: plan.priceVnd,
            currency: "vnd",
            paymentMethod: "bank_transfer",
            stripeSessionId: orderCode,
        },
    });

    revalidatePath("/admin/orders");

    return {
        success: true,
        orderId: order.id,
        orderCode,
        qrUrl: buildSepayQrUrl(order.amount, orderCode),
        amount: order.amount,
        bankName: SEPAY_CONFIG.bankName,
        accountNumber: SEPAY_CONFIG.accountNumber,
        accountHolder: SEPAY_CONFIG.accountHolder,
    };
}
