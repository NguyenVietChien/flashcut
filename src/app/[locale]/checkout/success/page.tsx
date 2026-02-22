"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle, Copy, ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function CheckoutSuccessContent() {
    const t = useTranslations("checkoutSuccess");
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [license, setLicense] = useState<{ key: string; plan: string; expiresAt: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!sessionId) return;
        fetch(`/api/checkout/verify?session_id=${sessionId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.license) setLicense(data.license);
            })
            .catch(() => { });
    }, [sessionId]);

    const copyKey = () => {
        if (!license) return;
        navigator.clipboard.writeText(license.key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4 pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card p-8 sm:p-12 max-w-lg w-full text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle className="w-10 h-10 text-success" />
                </motion.div>

                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                    {t("title")}
                </h1>
                <p className="text-text-secondary mb-8">
                    {t("subtitle")}
                </p>

                {license ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <p className="text-text-tertiary text-sm mb-2">{t("licenseKey")}</p>
                        <div className="flex items-center gap-2 bg-bg-secondary rounded-lg p-3 border border-border-default">
                            <code className="flex-1 text-accent font-mono text-sm sm:text-base break-all">
                                {license.key}
                            </code>
                            <button
                                onClick={copyKey}
                                className="shrink-0 p-2 hover:bg-accent/10 rounded-md transition-colors"
                                title="Copy"
                            >
                                <Copy className={`w-4 h-4 ${copied ? "text-success" : "text-text-tertiary"}`} />
                            </button>
                        </div>
                        <p className="text-text-tertiary text-xs mt-2">
                            {t("plan")}: <span className="text-text-primary font-medium">{license.plan.toUpperCase()}</span>
                            {" · "}
                            {t("expires")}: <span className="text-text-primary font-medium">{new Date(license.expiresAt).toLocaleDateString("vi-VN")}</span>
                        </p>
                    </motion.div>
                ) : (
                    <div className="mb-8 animate-pulse">
                        <div className="h-12 bg-bg-secondary rounded-lg" />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard" className="btn-accent flex items-center justify-center gap-2">
                        {t("dashboard")}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/download" className="btn-outline">
                        {t("download")}
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="animate-pulse text-text-secondary">Loading...</div>
            </main>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
