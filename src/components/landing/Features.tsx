"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Layers, Brain, Workflow } from "lucide-react";

const pillarIcons = [Layers, Brain, Workflow];
const pillarColors = ["text-accent", "text-info", "text-success"];
const pillarBgColors = ["bg-accent/10", "bg-info/10", "bg-success/10"];

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
};

const cardVariant = {
    hidden: { opacity: 0, y: 50, rotateX: 10 },
    visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

const itemVariant = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
};

export default function Features() {
    const t = useTranslations("features");
    const pillars = t.raw("pillars") as {
        title: string;
        description: string;
        items: string[];
    }[];

    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                        <span className="gradient-text animate-gradient">{t("title")}</span>
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
                    {pillars.map((pillar, i) => {
                        const Icon = pillarIcons[i];
                        return (
                            <motion.div
                                key={i}
                                variants={cardVariant}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="glass-card p-8 group hover-lift"
                            >
                                <motion.div
                                    className={`w-14 h-14 rounded-xl ${pillarBgColors[i]} flex items-center justify-center mb-6`}
                                    whileHover={{ scale: 1.15, rotate: 5, transition: { duration: 0.3 } }}
                                >
                                    <Icon className={`w-7 h-7 ${pillarColors[i]}`} />
                                </motion.div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">
                                    {pillar.title}
                                </h3>
                                <p className="text-text-secondary text-sm mb-5">
                                    {pillar.description}
                                </p>
                                <motion.ul
                                    variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
                                    className="space-y-2.5"
                                >
                                    {pillar.items.map((item, j) => (
                                        <motion.li
                                            key={j}
                                            variants={itemVariant}
                                            className="flex items-start gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors"
                                        >
                                            <span className="text-accent mt-0.5">✦</span>
                                            {item}
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
