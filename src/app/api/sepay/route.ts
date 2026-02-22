import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey, getLicenseExpiry } from "@/lib/license";
import { parseSepayOrderCode } from "@/lib/sepay";

interface SepayWebhookPayload {
    id: number;
    gateway: string;
    transactionDate: string;
    accountNumber: string;
    subAccount: string | null;
    code: string | null;
    content: string;
    transferType: string;
    description: string;
    transferAmount: number;
    referenceCode: string;
    accumulated: number;
}

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("Authorization");
        const expectedKey = process.env.SEPAY_API_KEY;

        if (expectedKey && apiKey !== `Bearer ${expectedKey}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload: SepayWebhookPayload = await req.json();

        if (payload.transferType !== "in") {
            return NextResponse.json({ success: true, message: "Skipped outgoing" });
        }

        const orderCode = parseSepayOrderCode(payload.content);
        if (!orderCode) {
            return NextResponse.json({ success: true, message: "No order code found" });
        }

        const order = await prisma.order.findFirst({
            where: {
                stripeSessionId: orderCode,
                status: "pending",
                paymentMethod: "bank_transfer",
            },
        });

        if (!order) {
            return NextResponse.json({ success: true, message: "Order not found" });
        }

        if (payload.transferAmount < order.amount) {
            return NextResponse.json({ success: true, message: "Insufficient amount" });
        }

        await prisma.order.update({
            where: { id: order.id },
            data: { status: "paid", paidAt: new Date() },
        });

        await prisma.license.create({
            data: {
                userId: order.userId,
                orderId: order.id,
                key: generateLicenseKey(order.plan),
                plan: order.plan,
                expiresAt: getLicenseExpiry(30),
            },
        });

        return NextResponse.json({ success: true, message: "License activated" });
    } catch (error) {
        console.error("SePay webhook error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
