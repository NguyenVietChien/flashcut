import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, PLANS, isValidPlan } from "@/lib/stripe";

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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                plan,
                amount: planConfig.price,
                currency: planConfig.currency,
                paymentMethod: "stripe",
            },
        });

        const checkoutSession = await getStripe().checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: planConfig.currency,
                        product_data: {
                            name: `FlashCut ${planConfig.name} License`,
                            description: `Gói ${planConfig.name} — 30 ngày sử dụng`,
                        },
                        unit_amount: planConfig.price,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                orderId: order.id,
                userId: session.user.id,
                plan,
            },
            success_url: `${appUrl}/vi/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/vi#pricing`,
        });

        await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: checkoutSession.id },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
