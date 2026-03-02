"use client";

import { useState } from "react";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { verifyAdminPin } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";

export default function AdminPinGate({ labels }: { labels: Record<string, string> }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await verifyAdminPin(pin);

        if (result.success) {
            router.refresh();
        } else {
            setAttempts((a) => a + 1);
            setError(result.error === "invalid_pin" ? labels.wrongPin : labels.configError);
            setPin("");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="w-full max-w-sm mx-4">
                <div className="glass-card p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-accent" />
                        </div>
                        <h1 className="text-xl font-bold text-text-primary">{labels.title}</h1>
                        <p className="text-sm text-text-tertiary mt-1 text-center">{labels.subtitle}</p>
                    </div>

                    {/* Warning after 3 failed attempts */}
                    {attempts >= 3 && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20 mb-6">
                            <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
                            <p className="text-xs text-error">{labels.tooManyAttempts}</p>
                        </div>
                    )}

                    {/* PIN Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder={labels.placeholder}
                                className="input-field pl-10 text-center tracking-[0.3em] font-mono"
                                autoFocus
                                autoComplete="off"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-error text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={!pin || loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? labels.verifying : labels.verify}
                        </button>
                    </form>

                    {/* Info */}
                    <p className="text-xs text-text-tertiary text-center mt-6">
                        {labels.sessionInfo}
                    </p>
                </div>
            </div>
        </div>
    );
}
