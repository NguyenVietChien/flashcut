"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Clock, RefreshCw, DollarSign } from "lucide-react";

const icons = [Clock, RefreshCw, DollarSign];

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
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

export default function PainPoints() {
    const t = useTranslations("painPoints");
    const items = t.raw("items") as { title: string; description: string }[];

    return (
        <section className="py-24 bg-bg-secondary relative overflow-hidden">
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
                    {items.map((item, i) => {
                        const Icon = icons[i];
                        return (
                            <motion.div
                                key={i}
                                variants={cardVariant}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className="glass-card p-8 text-center hover-lift"
                            >
                                <motion.div
                                    className="w-14 h-14 rounded-xl bg-error/10 flex items-center justify-center mx-auto mb-5"
                                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                                >
                                    <Icon className="w-7 h-7 text-error" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-text-primary mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
