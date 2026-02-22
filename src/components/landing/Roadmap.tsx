"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Rocket, Globe, Building2 } from "lucide-react";

const phaseIcons = [Rocket, Globe, Building2];
const phaseColors = ["text-accent", "text-info", "text-success"];
const phaseBg = ["bg-accent/10", "bg-info/10", "bg-success/10"];

export default function Roadmap() {
    const t = useTranslations("roadmap");
    const phases = t.raw("phases") as {
        title: string;
        period: string;
        description: string;
    }[];

    return (
        <section className="py-24 bg-bg-secondary relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 section-divider" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

                <div className="relative">
                    {/* Animated Timeline Line */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute left-8 top-0 bottom-0 w-0.5 origin-top md:left-1/2 md:-translate-x-0.5"
                        style={{
                            background: "linear-gradient(180deg, var(--accent), var(--info), var(--success))",
                        }}
                    />

                    <div className="space-y-12">
                        {phases.map((phase, i) => {
                            const Icon = phaseIcons[i];
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className={`relative flex items-start gap-6 md:gap-12 ${i % 2 === 0
                                            ? "md:flex-row"
                                            : "md:flex-row-reverse md:text-right"
                                        }`}
                                >
                                    {/* Animated Dot */}
                                    <motion.div
                                        className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-accent bg-bg-primary z-10"
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.2, type: "spring", stiffness: 300 }}
                                        animate={{
                                            boxShadow: [
                                                "0 0 0 0 rgba(0, 212, 255, 0.4)",
                                                "0 0 0 8px rgba(0, 212, 255, 0)",
                                            ],
                                        }}
                                    />

                                    {/* Content */}
                                    <motion.div
                                        className="ml-16 md:ml-0 md:w-1/2 glass-card p-6 hover-lift"
                                        whileHover={{ y: -4 }}
                                    >
                                        <div className={`flex items-center gap-3 mb-3 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                                            <motion.div
                                                className={`w-8 h-8 rounded-lg ${phaseBg[i]} flex items-center justify-center`}
                                                whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                                            >
                                                <Icon className={`w-4 h-4 ${phaseColors[i]}`} />
                                            </motion.div>
                                            <div>
                                                <span className="text-accent text-xs font-mono font-bold">
                                                    {phase.period}
                                                </span>
                                                <h3 className="text-text-primary font-semibold">
                                                    {phase.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <p className="text-text-secondary text-sm leading-relaxed">
                                            {phase.description}
                                        </p>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
