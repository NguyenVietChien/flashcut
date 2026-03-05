import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderCode, buildSepayQrUrl, SEPAY_CONFIG } from "@/lib/sepay";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan } = await req.json();
        if (!plan) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        // Fetch price from DB instead of hardcoded constant
        const planRecord = await prisma.plan.findFirst({
            where: { slug: plan, isActive: true },
            select: { name: true, priceVnd: true },
        });

        if (!planRecord) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const orderCode = generateOrderCode();

        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                plan,
                amount: planRecord.priceVnd,
                currency: "vnd",
                paymentMethod: "bank_transfer",
                stripeSessionId: orderCode,
            },
        });

        const qrUrl = buildSepayQrUrl(order.amount, orderCode);

        return NextResponse.json({
            orderId: order.id,
            orderCode,
            qrUrl,
            amount: order.amount,
            bankName: SEPAY_CONFIG.bankName,
            accountNumber: SEPAY_CONFIG.accountNumber,
            accountHolder: SEPAY_CONFIG.accountHolder,
        });
    } catch (error) {
        console.error("Bank transfer error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

