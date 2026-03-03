import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/plans/features
 * Public API — returns all active plans with display + features data.
 * Desktop app calls this once → caches locally for upsell UI.
 *
 * Response is cached for 1 hour (CDN + browser).
 */
export async function GET() {
    const plans = await prisma.plan.findMany({
        where: { isActive: true, product: { isActive: true } },
        select: {
            slug: true,
            name: true,
            priceVnd: true,
            priceUsd: true,
            features: true,
            display: {
                select: {
                    taglineVi: true, taglineEn: true,
                    highlightVi: true, highlightEn: true,
                    ctaVi: true, ctaEn: true,
                    emoji: true, sortOrder: true, isFeatured: true,
                },
            },
        },
        orderBy: { display: { sortOrder: "asc" } },
    });

    return NextResponse.json(
        { plans },
        {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
            },
        }
    );
}
