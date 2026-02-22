"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Send, Mail, User, MessageSquare, Tag } from "lucide-react";
import { useState, FormEvent } from "react";

export default function ContactPage() {
    const t = useTranslations("contact");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = new FormData(e.currentTarget);
        const data = {
            name: form.get("name"),
            email: form.get("email"),
            subject: form.get("subject"),
            message: form.get("message"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed");
            }

            setSent(true);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : t("error")
            );
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-12 text-center max-w-md"
                >
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                        <Send className="w-7 h-7 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                        {t("successTitle")}
                    </h2>
                    <p className="text-text-secondary">
                        {t("successMessage")}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                        {t("title")}
                    </h1>
                    <p className="text-text-secondary text-lg">
                        {t("subtitle")}
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    onSubmit={handleSubmit}
                    className="glass-card rounded-2xl p-8 space-y-6"
                >
                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-text-secondary text-sm mb-2">
                                {t("name")}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                <input
                                    name="name"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-secondary border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none transition-colors"
                                    placeholder={t("namePlaceholder")}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-text-secondary text-sm mb-2">
                                {t("email")}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-secondary border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-text-secondary text-sm mb-2">
                            {t("subject")}
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                            <input
                                name="subject"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-secondary border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none transition-colors"
                                placeholder={t("subjectPlaceholder")}
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-text-secondary text-sm mb-2">
                            {t("message")}
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-text-tertiary" />
                            <textarea
                                name="message"
                                required
                                rows={5}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-secondary border border-border-default text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none transition-colors resize-none"
                                placeholder={t("messagePlaceholder")}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-accent w-full flex items-center justify-center gap-2 !py-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                {t("send")}
                            </>
                        )}
                    </button>
                </motion.form>
            </div>
        </div>
    );
}
