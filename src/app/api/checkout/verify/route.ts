import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: { license: true },
    });

    if (!order || !order.license) {
        return NextResponse.json({ license: null });
    }

    return NextResponse.json({
        license: {
            key: order.license.key,
            plan: order.license.plan,
            expiresAt: order.license.expiresAt.toISOString(),
        },
    });
}
