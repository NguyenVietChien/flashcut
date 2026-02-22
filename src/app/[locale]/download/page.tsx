"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
    Download,
    Monitor,
    Cpu,
    HardDrive,
    Shield,
    Zap,
    CheckCircle,
} from "lucide-react";

export default function DownloadPage() {
    const t = useTranslations("download");

    const requirements = [
        { icon: Monitor, label: t("req.os"), value: "Windows 10/11 (64-bit)" },
        { icon: Cpu, label: t("req.cpu"), value: "Intel i5 / AMD Ryzen 5+" },
        { icon: HardDrive, label: t("req.ram"), value: "8 GB RAM" },
        { icon: HardDrive, label: t("req.disk"), value: "500 MB" },
    ];

    const features = [
        t("feat.auto"),
        t("feat.batch"),
        t("feat.effects"),
        t("feat.audio"),
        t("feat.templates"),
        t("feat.updates"),
    ];

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 mb-6">
                        <Zap className="w-4 h-4 text-accent" />
                        <span className="text-accent text-sm font-medium">
                            v2.0.0
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
                        {t("title")}
                    </h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
                        {t("subtitle")}
                    </p>

                    <motion.a
                        href="#"
                        className="btn-accent text-lg inline-flex items-center gap-3 !py-4 !px-10"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 0 30px var(--glow)",
                        }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Download className="w-5 h-5" />
                        {t("cta")}
                    </motion.a>

                    <p className="text-text-tertiary text-sm mt-4">
                        Windows 10/11 • 120 MB •{" "}
                        {t("free")}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* System Requirements */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="glass-card rounded-2xl p-8"
                    >
                        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-accent" />
                            {t("requirements")}
                        </h2>
                        <div className="space-y-4">
                            {requirements.map((req, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4"
                                >
                                    <req.icon className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                                    <div>
                                        <p className="text-text-tertiary text-sm">
                                            {req.label}
                                        </p>
                                        <p className="text-text-primary font-medium">
                                            {req.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* What's Included */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="glass-card rounded-2xl p-8"
                    >
                        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-accent" />
                            {t("included")}
                        </h2>
                        <ul className="space-y-3">
                            {features.map((feature, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                    <span className="text-text-secondary">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
