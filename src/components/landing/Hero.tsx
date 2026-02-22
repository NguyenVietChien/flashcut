"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap, Play, ArrowRight } from "lucide-react";

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
    const t = useTranslations("hero");

    const stats = [
        t("stats.features"),
        t("stats.models"),
        t("stats.videos"),
        t("stats.users"),
    ];

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-float" />
                <div
                    className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-info/8 rounded-full blur-[100px] animate-float"
                    style={{ animationDelay: "2s" }}
                />
                <div
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-[80px] animate-float"
                    style={{ animationDelay: "4s" }}
                />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            >
                {/* Badge */}
                <motion.div
                    variants={fadeUp}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 mb-8 animate-subtle-bounce"
                >
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-accent text-sm font-medium">
                        {t("badge")}
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={fadeUp}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-6"
                >
                    {t("title").split(" ").map((word, i) => {
                        const isHighlight = ["Video", "2", "Phút", "Minutes"].includes(word);
                        return (
                            <span key={i}>
                                {isHighlight ? (
                                    <span className="gradient-text animate-gradient">{word}</span>
                                ) : (
                                    word
                                )}{" "}
                            </span>
                        );
                    })}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={fadeUp}
                    className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    {t("subtitle")}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    variants={fadeUp}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <motion.a
                        href="#cta"
                        className="btn-accent text-base flex items-center gap-2 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {t("cta")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                    <motion.a
                        href="#demo"
                        className="btn-outline text-base flex items-center gap-2 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {t("demo")}
                    </motion.a>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    variants={fadeUp}
                    className="glass-card inline-flex flex-wrap justify-center divide-x divide-border-default px-2 py-3 animate-pulse-glow"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                            className="px-5 sm:px-8 py-1"
                        >
                            <span className="text-sm sm:text-base font-semibold text-accent">
                                {stat.split(" ")[0]}{" "}
                                <span className="text-text-secondary font-normal">
                                    {stat.split(" ").slice(1).join(" ")}
                                </span>
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-16"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-6 h-10 border-2 border-text-tertiary rounded-full mx-auto flex justify-center pt-2"
                    >
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}
