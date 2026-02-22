"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check, Zap, Rocket, Crown, Loader2 } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { useState } from "react";

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const cardVariant = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

const tierIcons = [Zap, Rocket, Crown];
const tierIconColors = ["text-accent", "text-accent", "text-gold"];
const tierIconBg = ["bg-accent/10", "bg-accent/10", "bg-gold/10"];

export default function Pricing() {
    const t = useTranslations("pricing");
    const plans = t.raw("plans") as {
        name: string;
        emoji: string;
        price: string;
        tagline: string;
        cta: string;
        features: string[];
    }[];

    const tierStyles = [
        { border: "border-border-default", btn: "btn-outline", accent: "" },
        { border: "border-accent", btn: "btn-accent", accent: "gradient-border" },
        { border: "border-gold/50", btn: "btn-outline !border-gold !text-gold hover:!bg-gold/10", accent: "" },
    ];

    const planIds = ["basic", "pro", "ultra"];
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleCheckout = (planId: string) => {
        setLoadingPlan(planId);
        window.location.href = `/vi/checkout/bank-transfer?plan=${planId}`;
    };

    return (
        <section id="pricing" className="py-24 bg-bg-secondary relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 section-divider" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
                    className="grid md:grid-cols-3 gap-6 items-stretch"
                >
                    {plans.map((plan, i) => {
                        const style = tierStyles[i];
                        const isPro = i === 1;
                        const TierIcon = tierIcons[i];

                        return (
                            <motion.div
                                key={i}
                                variants={cardVariant}
                                whileHover={{
                                    y: -8,
                                    transition: { duration: 0.25 },
                                }}
                                className={`relative glass-card p-8 flex flex-col ${style.border} ${style.accent} ${isPro ? "md:-mt-4 md:mb-0 animate-pulse-glow overflow-visible pt-10" : ""
                                    }`}
                            >
                                {isPro && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-black text-xs font-bold rounded-full z-10"
                                    >
                                        {t("popular")}
                                    </motion.div>
                                )}

                                <div className="mb-6 flex items-center gap-3">
                                    <motion.div
                                        className={`w-10 h-10 rounded-xl ${tierIconBg[i]} flex items-center justify-center`}
                                        whileHover={{ scale: 1.15, rotate: 10 }}
                                    >
                                        <TierIcon className={`w-5 h-5 ${tierIconColors[i]}`} />
                                    </motion.div>
                                    <span className="text-lg font-bold text-text-primary">
                                        {plan.name}
                                    </span>
                                </div>

                                <div className="mb-2">
                                    <span className="text-4xl font-bold text-text-primary">
                                        {plan.price}
                                    </span>
                                    <span className="text-text-secondary text-sm">
                                        {t("currency")}{t("period")}
                                    </span>
                                </div>

                                <p className="text-text-secondary text-sm mb-6">
                                    {plan.tagline}
                                </p>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, j) => (
                                        <motion.li
                                            key={j}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + j * 0.05 }}
                                            className="flex items-start gap-2 text-sm text-text-secondary"
                                        >
                                            <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                            {feature}
                                        </motion.li>
                                    ))}
                                </ul>

                                {i < 2 ? (
                                    <motion.button
                                        onClick={() => handleCheckout(planIds[i])}
                                        disabled={loadingPlan !== null}
                                        className={`${style.btn} text-center w-full block cursor-pointer disabled:opacity-50`}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        {loadingPlan === planIds[i] ? (
                                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                        ) : (
                                            plan.cta
                                        )}
                                    </motion.button>
                                ) : (
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Link href="/contact" className={`${style.btn} text-center w-full block`}>
                                            {plan.cta}
                                        </Link>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

