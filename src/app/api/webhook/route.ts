import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey, getLicenseExpiry } from "@/lib/license";

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const sig = headerList.get("stripe-signature");

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event;
    try {
        event = getStripe().webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { orderId, userId, plan } = session.metadata || {};

        if (!orderId || !userId || !plan) {
            return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "paid",
                paidAt: new Date(),
            },
        });

        await prisma.license.create({
            data: {
                userId,
                orderId,
                key: generateLicenseKey(plan),
                plan,
                expiresAt: getLicenseExpiry(30),
            },
        });
    }

    return NextResponse.json({ received: true });
}
