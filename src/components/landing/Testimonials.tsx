"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
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

export default function Testimonials() {
    const t = useTranslations("testimonials");
    const items = t.raw("items") as {
        name: string;
        role: string;
        quote: string;
    }[];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 section-divider" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    className="grid md:grid-cols-3 gap-6"
                >
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            variants={cardVariant}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className="glass-card p-8 hover-lift group"
                        >
                            <motion.div
                                initial={{ opacity: 0.3 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.15 }}
                            >
                                <Quote className="w-8 h-8 text-accent/30 mb-4 group-hover:text-accent/60 transition-colors" />
                            </motion.div>

                            <p className="text-text-secondary italic leading-relaxed mb-6">
                                &ldquo;{item.quote}&rdquo;
                            </p>

                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                >
                                    {item.name.charAt(0)}
                                </motion.div>
                                <div>
                                    <p className="text-text-primary font-semibold text-sm">
                                        {item.name}
                                    </p>
                                    <p className="text-text-tertiary text-xs">{item.role}</p>
                                </div>
                            </div>

                            <div className="flex gap-1 mt-4">
                                {[...Array(5)].map((_, j) => (
                                    <motion.div
                                        key={j}
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.5 + i * 0.15 + j * 0.08,
                                            type: "spring",
                                            stiffness: 300,
                                        }}
                                    >
                                        <Star className="w-4 h-4 text-accent fill-accent" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
