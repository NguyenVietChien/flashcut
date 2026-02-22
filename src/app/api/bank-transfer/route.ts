import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidPlan, PLANS } from "@/lib/stripe";
import { generateOrderCode, buildSepayQrUrl, SEPAY_CONFIG } from "@/lib/sepay";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan } = await req.json();
        if (!plan || !isValidPlan(plan)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const planConfig = PLANS[plan];
        const orderCode = generateOrderCode();

        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                plan,
                amount: planConfig.price,
                currency: planConfig.currency,
                paymentMethod: "bank_transfer",
                stripeSessionId: orderCode,
            },
        });

        const qrUrl = buildSepayQrUrl(planConfig.price, orderCode);

        return NextResponse.json({
            orderId: order.id,
            orderCode,
            qrUrl,
            amount: planConfig.price,
            bankName: SEPAY_CONFIG.bankName,
            accountNumber: SEPAY_CONFIG.accountNumber,
            accountHolder: SEPAY_CONFIG.accountHolder,
        });
    } catch (error) {
        console.error("Bank transfer error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
