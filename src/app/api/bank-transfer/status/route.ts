import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
        return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { license: true },
    });

    if (!order) {
        return NextResponse.json({ status: "not_found" });
    }

    return NextResponse.json({
        status: order.status,
        license: order.license
            ? {
                key: order.license.key,
                plan: order.license.plan,
                expiresAt: order.license.expiresAt.toISOString(),
            }
            : null,
    });
}
