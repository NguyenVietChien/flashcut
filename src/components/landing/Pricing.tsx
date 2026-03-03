"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
    Check,
    Zap,
    Rocket,
    Crown,
    Loader2,
    Settings,
    Brain,
    Mic,
    Layers,
    Plug,
    Sparkles,
    Film,
    Cpu,
    BarChart3,
} from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { useState } from "react";

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const cardVariant = {
    hidden: { opacity: 0, y: 50, scale: 0.93 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

/* Maps icon name from DB → Lucide component */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    film: Film, "Film": Film,
    sparkles: Sparkles, "Sparkles": Sparkles,
    brain: Brain, "Brain": Brain,
    layers: Layers, "Layers": Layers,
    settings: Settings, "Settings": Settings,
    mic: Mic, "Mic": Mic,
    "bar-chart": BarChart3, "BarChart3": BarChart3,
    cpu: Cpu, "Cpu": Cpu,
    plug: Plug, "Plug": Plug,
};

/* Maps group name → icon (fallback for legacy data without icon field) */
const groupIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "Create": Film, "Tạo video": Film,
    "Polish": Sparkles, "Hoàn thiện": Sparkles,
    "AI Assist": Brain, "AI hỗ trợ": Brain,
    "Deliver": Layers, "Xuất bản": Layers,
    "Power Tools": Settings, "Sức mạnh": Settings,
    "AI Brain": Brain, "AI thông minh": Brain,
    "Voice & Subtitle": Mic, "Giọng nói & Phụ đề": Mic,
    "Workflow": BarChart3, "Quy trình": BarChart3,
    "AI Director": Cpu,
    "Creative Studio": Mic,
    "Scale": Layers, "Mở rộng": Layers,
    "Connect": Plug, "Kết nối": Plug,
};

// ─── Types from DB ───────────────────────────────────────────

interface FeatureGroup {
    group: string;
    icon?: string;
    items: string[];
}

export interface PricingPlan {
    slug: string;
    name: string;
    priceVnd: number;
    priceUsd: number | null;
    features: { vi: FeatureGroup[]; en: FeatureGroup[] } | null;
    display: {
        taglineVi: string | null;
        taglineEn: string | null;
        highlightVi: string | null;
        highlightEn: string | null;
        ctaVi: string | null;
        ctaEn: string | null;
        emoji: string | null;
        sortOrder: number;
        isFeatured: boolean;
    } | null;
}

interface PricingProps {
    plans: PricingPlan[];
    locale: string;
}

// Tier styling per index position
const tierStyles = [
    { border: "border-border-default", btn: "btn-outline", accent: "", headerGradient: "from-accent/5 to-transparent", iconColor: "text-accent", iconBg: "bg-accent/10", TierIcon: Zap },
    { border: "border-accent", btn: "btn-accent", accent: "gradient-border", headerGradient: "from-accent/10 via-info/5 to-transparent", iconColor: "text-accent", iconBg: "bg-accent/10", TierIcon: Rocket },
    { border: "border-gold/50", btn: "btn-outline !border-gold !text-gold hover:!bg-gold/10", accent: "", headerGradient: "from-gold/10 to-transparent", iconColor: "text-gold", iconBg: "bg-gold/10", TierIcon: Crown },
];

export default function Pricing({ plans, locale }: PricingProps) {
    const t = useTranslations("pricing");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleCheckout = (planSlug: string) => {
        setLoadingPlan(planSlug);
        window.location.href = `/${locale}/checkout/bank-transfer?plan=${planSlug}`;
    };

    const isVi = locale === "vi";

    return (
        <section id="pricing" className="py-24 bg-bg-secondary relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 section-divider" />

            {/* Background glows */}
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-info/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                        {t("title")}
                    </h2>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
                >
                    {plans.map((plan, i) => {
                        const style = tierStyles[i] || tierStyles[0];
                        const isFeatured = plan.display?.isFeatured ?? false;
                        const isUltra = i === 2;
                        const TierIcon = style.TierIcon;

                        // Locale-aware fields
                        const tagline = isVi ? plan.display?.taglineVi : plan.display?.taglineEn;
                        const highlight = isVi ? plan.display?.highlightVi : plan.display?.highlightEn;
                        const cta = isVi ? plan.display?.ctaVi : plan.display?.ctaEn;

                        // Features for current locale
                        const featureGroups: FeatureGroup[] = plan.features
                            ? (isVi ? plan.features.vi : plan.features.en) || []
                            : [];

                        const featureCount = featureGroups.reduce((sum, g) => sum + g.items.length, 0);

                        // Format price: locale-aware currency
                        const formattedPrice = isVi
                            ? new Intl.NumberFormat("vi-VN").format(plan.priceVnd) + "đ"
                            : plan.priceUsd
                                ? "$" + new Intl.NumberFormat("en-US").format(plan.priceUsd)
                                : new Intl.NumberFormat("vi-VN").format(plan.priceVnd) + "đ";

                        return (
                            <motion.div
                                key={plan.slug}
                                variants={cardVariant}
                                whileHover={{
                                    y: -8,
                                    transition: { duration: 0.25 },
                                }}
                                className={`relative flex flex-col rounded-2xl border transition-all duration-300
                                    ${style.border} ${style.accent}
                                    ${isFeatured
                                        ? "md:-mt-4 md:mb-0 animate-pulse-glow overflow-visible bg-[var(--glass-bg)] backdrop-blur-xl"
                                        : "bg-[var(--glass-bg)] backdrop-blur-xl"
                                    }
                                    hover:border-[var(--accent)] hover:shadow-[0_0_30px_var(--glow)]
                                `}
                            >
                                {/* Popular badge */}
                                {isFeatured && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-accent text-black text-xs font-bold rounded-full z-10 shadow-[0_0_20px_var(--glow)]"
                                    >
                                        {t("popular")}
                                    </motion.div>
                                )}

                                {/* Header section */}
                                <div className={`p-8 pb-6 bg-gradient-to-b ${style.headerGradient} rounded-t-2xl`}>
                                    {/* Tier icon + name */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <motion.div
                                            className={`w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center`}
                                            whileHover={{ scale: 1.15, rotate: 10 }}
                                        >
                                            <TierIcon className={`w-5 h-5 ${style.iconColor}`} />
                                        </motion.div>
                                        <span className="text-xl font-bold text-text-primary tracking-wide">
                                            {plan.name}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-1">
                                        <span className={`text-5xl font-extrabold ${isUltra ? "text-gold" : "text-text-primary"}`}>
                                            {formattedPrice}
                                        </span>
                                        <span className="text-text-secondary text-sm ml-1">
                                            /{isVi ? "tháng" : "month"}
                                        </span>
                                    </div>

                                    {/* Tagline */}
                                    <p className="text-text-secondary text-sm mb-4">
                                        {tagline || ""}
                                    </p>

                                    {/* Highlight badge */}
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full
                                            ${isUltra
                                                ? "bg-gold/15 text-gold border border-gold/20"
                                                : "bg-accent/10 text-accent border border-accent/20"
                                            }`}
                                        >
                                            {featureCount} features
                                        </span>
                                        {i > 0 && highlight && (
                                            <span className="text-xs text-text-tertiary">
                                                {highlight}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mx-8 h-px bg-gradient-to-r from-transparent via-border-default to-transparent" />

                                {/* Feature groups */}
                                <div className="p-8 pt-6 flex-1 flex flex-col">
                                    <div className="space-y-5 flex-1">
                                        {featureGroups.map((fg, gi) => {
                                            const GroupIcon = (fg.icon && iconMap[fg.icon]) || groupIconMap[fg.group] || Settings;
                                            return (
                                                <div key={gi}>
                                                    {/* Group heading */}
                                                    <div className="flex items-center gap-2 mb-2.5">
                                                        <GroupIcon className={`w-3.5 h-3.5 ${isUltra ? "text-gold/60" : "text-accent/60"}`} />
                                                        <span className={`text-[11px] font-semibold uppercase tracking-widest ${isUltra ? "text-gold/50" : "text-accent/50"}`}>
                                                            {fg.group}
                                                        </span>
                                                    </div>
                                                    {/* Feature items */}
                                                    <ul className="space-y-2">
                                                        {fg.items.map((feature, j) => (
                                                            <motion.li
                                                                key={j}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                whileInView={{ opacity: 1, x: 0 }}
                                                                viewport={{ once: true }}
                                                                transition={{ delay: 0.3 + gi * 0.08 + j * 0.04 }}
                                                                className="flex items-start gap-2.5 text-sm text-text-secondary"
                                                            >
                                                                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isUltra ? "text-gold" : "text-success"}`} />
                                                                <span>{feature}</span>
                                                            </motion.li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* CTA Button */}
                                    <div className="mt-auto pt-8">
                                        {i < 2 ? (
                                            <motion.button
                                                onClick={() => handleCheckout(plan.slug)}
                                                disabled={loadingPlan !== null}
                                                className={`${style.btn} text-center w-full block cursor-pointer disabled:opacity-50 !py-3.5 !text-base !font-bold !rounded-xl`}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                            >
                                                {loadingPlan === plan.slug ? (
                                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                                ) : (
                                                    cta || plan.name
                                                )}
                                            </motion.button>
                                        ) : (
                                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                <Link href="/contact" className={`${style.btn} text-center w-full block !py-3.5 !text-base !font-bold !rounded-xl`}>
                                                    {cta || plan.name}
                                                </Link>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
