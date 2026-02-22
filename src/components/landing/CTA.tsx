"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

export default function CTA() {
    const t = useTranslations("cta");

    return (
        <section id="cta" className="py-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 section-divider" />

            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[150px]"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-info/8 rounded-full blur-[80px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 20, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 mb-6"
                >
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-accent text-sm font-medium">Early Bird -20%</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-6"
                >
                    {t("title").split("60x").map((part, i, arr) =>
                        i < arr.length - 1 ? (
                            <span key={i}>
                                {part}
                                <span className="gradient-text animate-gradient">60x</span>
                            </span>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="text-text-secondary text-lg mb-10 max-w-xl mx-auto"
                >
                    {t("subtitle")}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px var(--glow)" }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Link
                            href="/download"
                            className="btn-accent text-base flex items-center gap-2 group"
                        >
                            {t("primary")}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Link
                            href="/contact"
                            className="btn-outline text-base"
                        >
                            {t("secondary")}
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
