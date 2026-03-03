import { NextResponse } from "next/server";
import { issueBotLicense } from "@/lib/services/license.service";

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

        const result = await issueBotLicense({
            productSlug, planSlug, source, contactInfo, buyerEmail, note,
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to issue license";
        const status = message.includes("not found") ? 404 : 500;
        if (status === 500) console.error("License issue error:", error);
        return NextResponse.json({ error: message }, { status });
    }
}

