import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import Features from "@/components/landing/Features";
import Partners from "@/components/landing/Partners";
import HowItWorks from "@/components/landing/HowItWorks";
import Comparison from "@/components/landing/Comparison";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import Roadmap from "@/components/landing/Roadmap";
import CTA from "@/components/landing/CTA";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";

export default async function HomePage() {
    const locale = await getLocale();

    // Fetch active plans with display data, sorted by sortOrder
    const plans = await prisma.plan.findMany({
        where: { isActive: true, product: { isActive: true } },
        select: {
            slug: true,
            name: true,
            priceVnd: true,
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

    // Serialize for client component (Prisma Json → typed object)
    const serializedPlans = plans.map((p) => ({
        ...p,
        features: p.features as { vi: { group: string; icon?: string; items: string[] }[]; en: { group: string; icon?: string; items: string[] }[] } | null,
    }));

    return (
        <>
            <Hero />
            <PainPoints />
            <Features />
            <Partners />
            <HowItWorks />
            <Comparison />
            <Pricing plans={serializedPlans} locale={locale} />
            <Testimonials />
            {/* <Roadmap /> */}
            <CTA />
        </>
    );
}
