import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateLicenseKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segments = [];
    for (let i = 0; i < 4; i++) {
        let seg = "";
        for (let j = 0; j < 5; j++) {
            seg += chars[crypto.randomInt(chars.length)];
        }
        segments.push(seg);
    }
    return segments.join("-");
}

/**
 * POST /api/licenses/issue
 * Bot API endpoint for issuing licenses from Telegram/Zalo bots
 * 
 * Headers: { "x-api-secret": "your-bot-secret" }
 * Body: {
 *   "productSlug": "flashcut",
 *   "planSlug": "pro",
 *   "source": "telegram",
 *   "contactInfo": "tg:@username",
 *   "buyerEmail": null,
 *   "note": "Mua qua Telegram"
 * }
 */
export async function POST(request: Request) {
    // Verify API secret
    const apiSecret = request.headers.get("x-api-secret");
    const expectedSecret = process.env.BOT_API_SECRET;

    if (!expectedSecret || apiSecret !== expectedSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { productSlug, planSlug, source, contactInfo, buyerEmail, note } = body;

        if (!productSlug || !planSlug) {
            return NextResponse.json(
                { error: "productSlug and planSlug are required" },
                { status: 400 }
            );
        }

        // Find product
        const product = await prisma.product.findUnique({
            where: { slug: productSlug },
        });

        if (!product) {
            return NextResponse.json(
                { error: `Product '${productSlug}' not found` },
                { status: 404 }
            );
        }

        // Find plan
        const plan = await prisma.plan.findUnique({
            where: { productId_slug: { productId: product.id, slug: planSlug } },
        });

        if (!plan) {
            return NextResponse.json(
                { error: `Plan '${planSlug}' not found for product '${productSlug}'` },
                { status: 404 }
            );
        }

        // Calculate expiry
        const expiresAt = plan.durationDays
            ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000)
            : null;

        // Create license
        const licenseKey = generateLicenseKey();
        const license = await prisma.license.create({
            data: {
                key: licenseKey,
                productId: product.id,
                plan: planSlug,
                tier: planSlug,
                source: source || "web",
                contactInfo: contactInfo || null,
                email: buyerEmail || null,
                note: note || null,
                maxActivations: plan.maxActivations,
                usageLimit: plan.usageLimit,
                expiresAt,
            },
        });

        return NextResponse.json({
            success: true,
            licenseKey: license.key,
            product: product.name,
            plan: plan.name,
            expiresAt: license.expiresAt?.toISOString() || null,
        });
    } catch (error) {
        console.error("License issue error:", error);
        return NextResponse.json(
            { error: "Failed to issue license" },
            { status: 500 }
        );
    }
}
