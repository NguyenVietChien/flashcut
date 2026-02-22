"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const rowVariant = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
};

export default function Comparison() {
    const t = useTranslations("comparison");
    const headers = t.raw("headers") as string[];
    const rows = t.raw("rows") as string[][];

    return (
        <section className="py-24 relative">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="overflow-x-auto glass-card p-1 rounded-xl"
                >
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border-default">
                                {headers.map((header, i) => (
                                    <th
                                        key={i}
                                        className={`py-4 px-6 text-sm font-semibold ${i === headers.length - 1
                                            ? "text-accent"
                                            : "text-text-primary"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {header}
                                            {i === headers.length - 1 && (
                                                <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <motion.tr
                                    key={i}
                                    custom={i}
                                    variants={rowVariant}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="border-b border-border-default/50 hover:bg-bg-hover/50 transition-colors duration-200"
                                >
                                    {row.map((cell, j) => (
                                        <td
                                            key={j}
                                            className={`py-4 px-6 text-sm ${j === 0
                                                ? "text-text-primary font-medium"
                                                : j === row.length - 1
                                                    ? "text-accent font-semibold"
                                                    : "text-text-secondary"
                                                }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {j === row.length - 1 && (
                                                    <Check className="w-4 h-4 text-success shrink-0" />
                                                )}
                                                {cell}
                                            </span>
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </section>
    );
}
