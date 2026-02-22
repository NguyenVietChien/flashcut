"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Copy, CheckCircle, Clock, ArrowLeft, Building2 } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";

interface BankInfo {
    orderId: string;
    orderCode: string;
    qrUrl: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

function BankTransferContent() {
    const t = useTranslations("bankTransfer");
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan") || "pro";

    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
    const [status, setStatus] = useState<"loading" | "waiting" | "paid" | "error">("loading");
    const [license, setLicense] = useState<{ key: string; plan: string; expiresAt: string } | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/bank-transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
        })
            .then((r) => {
                if (r.status === 401) {
                    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`;
                    return null;
                }
                return r.json();
            })
            .then((data) => {
                if (!data) return;
                if (data.orderId) {
                    setBankInfo(data);
                    setStatus("waiting");
                } else {
                    setStatus("error");
                }
            })
            .catch(() => setStatus("error"));
    }, [plan]);

    const poll = useCallback(() => {
        if (!bankInfo || status === "paid") return;
        fetch(`/api/bank-transfer/status?order_id=${bankInfo.orderId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.status === "paid" && data.license) {
                    setStatus("paid");
                    setLicense(data.license);
                }
            })
            .catch(() => { });
    }, [bankInfo, status]);

    useEffect(() => {
        if (status !== "waiting") return;
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [status, poll]);

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat("vi-VN").format(amount) + " ₫";

    if (status === "loading") {
        return (
            <main className="min-h-screen bg-bg-primary flex items-center justify-center pt-20">
                <div className="animate-pulse text-text-secondary">{t("loading")}</div>
            </main>
        );
    }

    if (status === "paid" && license) {
        return (
            <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 sm:p-12 max-w-lg w-full text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-success" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-3">{t("successTitle")}</h1>
                    <p className="text-text-secondary mb-6">{t("successSubtitle")}</p>

                    <div className="bg-bg-secondary rounded-lg p-3 border border-border-default mb-4">
                        <p className="text-text-tertiary text-xs mb-1">{t("licenseKey")}</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-accent font-mono text-sm break-all">{license.key}</code>
                            <button onClick={() => copyText(license.key, "key")} className="p-2 hover:bg-accent/10 rounded-md">
                                <Copy className={`w-4 h-4 ${copied === "key" ? "text-success" : "text-text-tertiary"}`} />
                            </button>
                        </div>
                    </div>
                    <p className="text-text-tertiary text-xs mb-8">
                        {t("plan")}: <span className="text-text-primary font-medium">{license.plan.toUpperCase()}</span>
                        {" · "}{t("expires")}: <span className="text-text-primary font-medium">{new Date(license.expiresAt).toLocaleDateString("vi-VN")}</span>
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Link href="/dashboard" className="btn-accent">{t("dashboard")}</Link>
                        <Link href="/download" className="btn-outline">{t("download")}</Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-bg-primary pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Link href="/#pricing" className="inline-flex items-center gap-1 text-text-tertiary hover:text-accent mb-6 text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t("back")}
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 sm:p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 className="w-6 h-6 text-accent" />
                        <h1 className="text-xl font-bold text-text-primary">{t("title")}</h1>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center">
                            <p className="text-text-secondary text-sm mb-3">{t("scanQr")}</p>
                            {bankInfo && (
                                <img
                                    src={bankInfo.qrUrl}
                                    alt="QR Code"
                                    className="w-48 h-48 rounded-lg bg-white p-2"
                                />
                            )}
                        </div>

                        <div className="space-y-3">
                            {bankInfo && (
                                <>
                                    <InfoRow label={t("bank")} value={bankInfo.bankName} onCopy={() => copyText(bankInfo.bankName, "bank")} copied={copied === "bank"} />
                                    <InfoRow label={t("accountNumber")} value={bankInfo.accountNumber} onCopy={() => copyText(bankInfo.accountNumber, "acc")} copied={copied === "acc"} />
                                    <InfoRow label={t("accountHolder")} value={bankInfo.accountHolder} onCopy={() => copyText(bankInfo.accountHolder, "holder")} copied={copied === "holder"} />
                                    <InfoRow label={t("amount")} value={formatAmount(bankInfo.amount)} onCopy={() => copyText(bankInfo.amount.toString(), "amount")} copied={copied === "amount"} />
                                    <InfoRow label={t("content")} value={bankInfo.orderCode} onCopy={() => copyText(bankInfo.orderCode, "code")} copied={copied === "code"} highlight />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-amber-400 text-sm font-medium mb-1">⚠️ {t("important")}</p>
                        <p className="text-text-secondary text-xs">{t("contentWarning")}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-text-tertiary text-sm">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>{t("waiting")}</span>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

function InfoRow({ label, value, onCopy, copied, highlight }: {
    label: string; value: string; onCopy: () => void; copied: boolean; highlight?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between p-2.5 rounded-lg border ${highlight ? "border-accent/50 bg-accent/5" : "border-border-default bg-bg-secondary"}`}>
            <div>
                <p className="text-text-tertiary text-xs">{label}</p>
                <p className={`font-medium text-sm ${highlight ? "text-accent" : "text-text-primary"}`}>{value}</p>
            </div>
            <button onClick={onCopy} className="p-1.5 hover:bg-accent/10 rounded-md shrink-0">
                <Copy className={`w-3.5 h-3.5 ${copied ? "text-success" : "text-text-tertiary"}`} />
            </button>
        </div>
    );
}

export default function BankTransferPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="animate-pulse text-text-secondary">Loading...</div>
            </main>
        }>
            <BankTransferContent />
        </Suspense>
    );
}
