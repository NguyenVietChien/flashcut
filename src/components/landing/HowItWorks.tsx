"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FileText, Sparkles, Video } from "lucide-react";

const stepIcons = [FileText, Sparkles, Video];

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.25, delayChildren: 0.2 } },
};

const stepVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export default function HowItWorks() {
    const t = useTranslations("howItWorks");
    const steps = t.raw("steps") as { title: string; description: string }[];

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
                    className="grid md:grid-cols-3 gap-8 relative"
                >
                    {/* Animated Connecting Line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                        className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 origin-left"
                        style={{
                            background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
                        }}
                    />

                    {steps.map((step, i) => {
                        const Icon = stepIcons[i];
                        return (
                            <motion.div
                                key={i}
                                variants={stepVariant}
                                className="relative text-center group"
                            >
                                {/* Step Circle */}
                                <motion.div
                                    className="relative z-10 w-16 h-16 rounded-full border-2 border-accent bg-bg-primary flex items-center justify-center mx-auto mb-6"
                                    whileHover={{
                                        scale: 1.15,
                                        boxShadow: "0 0 30px var(--glow), 0 0 60px rgba(0, 212, 255, 0.1)",
                                        transition: { duration: 0.3 },
                                    }}
                                    animate={{
                                        boxShadow: [
                                            "0 0 20px var(--glow)",
                                            "0 0 35px var(--glow)",
                                            "0 0 20px var(--glow)",
                                        ],
                                    }}
                                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                                >
                                    <Icon className="w-7 h-7 text-accent" />
                                </motion.div>

                                <motion.span
                                    className="text-accent text-sm font-mono font-bold mb-2 block"
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + i * 0.2, type: "spring", stiffness: 200 }}
                                >
                                    0{i + 1}
                                </motion.span>

                                <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed text-sm">
                                    {step.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
