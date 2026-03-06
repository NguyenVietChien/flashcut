"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Trash2,
    RefreshCw,
    KeyRound,
    Server,
    AlertCircle,
    Eye,
    EyeOff,
    Copy,
    Check,
} from "lucide-react";
import { PROVIDERS } from "@/lib/litellm";

// ──────────────────────────── Types ────────────────────────────

interface KeyModel {
    model_id: string;
    model_name: string;
    litellm_params: {
        model: string;
        api_key?: string;
        [key: string]: unknown;
    };
    model_info: {
        id: string;
        db_model: boolean;
        created_at?: string;
        updated_at?: string;
        [key: string]: unknown;
    };
}

interface Labels {
    [key: string]: string;
}

// ──────────────────────────── Helpers ────────────────────────────

function maskKey(key: string): string {
    if (!key || key.length < 16) return "••••••••";
    return `${key.slice(0, 8)}••••${key.slice(-4)}`;
}

function getProviderName(model: string): string {
    const prefix = model.split("/")[0];
    const provider = PROVIDERS.find((p) => p.id === prefix);
    return provider?.name || prefix;
}

function getProviderColor(model: string): string {
    const prefix = model.split("/")[0];
    const colors: Record<string, string> = {
        gemini: "bg-blue-500/15 text-blue-400 border-blue-500/20",
        openai: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        anthropic: "bg-orange-500/15 text-orange-400 border-orange-500/20",
        groq: "bg-purple-500/15 text-purple-400 border-purple-500/20",
        deepgram: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
        elevenlabs: "bg-pink-500/15 text-pink-400 border-pink-500/20",
    };
    return colors[prefix] || "bg-gray-500/15 text-gray-400 border-gray-500/20";
}

// ──────────────────────────── Main ────────────────────────────

export function KeysAdminClient({
    initialModels,
    labels: t,
    fetchError,
}: {
    initialModels: KeyModel[];
    labels: Labels;
    fetchError?: string;
}) {
    const router = useRouter();
    const [models, setModels] = useState<KeyModel[]>(initialModels);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<KeyModel | null>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState(fetchError || "");

    function handleRefresh() {
        startTransition(() => router.refresh());
    }

    async function handleDelete(model: KeyModel) {
        setError("");
        try {
            const res = await fetch("/api/admin/keys", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: model.model_info.id }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Delete failed");
            }
            setModels((prev) => prev.filter((m) => m.model_info.id !== model.model_info.id));
            setDeleteTarget(null);
        } catch (e: any) {
            setError(e.message);
        }
    }

    function handleAddSuccess() {
        setDialogOpen(false);
        handleRefresh();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">{t.keysTitle || "API Keys"}</h2>
                    <p className="text-sm text-text-tertiary mt-1">
                        {t.keysSubtitle || "Manage provider API keys for LiteLLM Proxy"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-bg-hover text-text-secondary hover:bg-bg-tertiary transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => setDialogOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-accent text-white hover:bg-accent/90 transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        {t.addKey || "Add Key"}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    label={t.totalKeys || "Total Keys"}
                    value={models.length}
                    icon={<KeyRound className="w-5 h-5" />}
                />
                <StatCard
                    label={t.providers || "Providers"}
                    value={new Set(models.map((m) => m.litellm_params.model.split("/")[0])).size}
                    icon={<Server className="w-5 h-5" />}
                />
                <StatCard
                    label={t.dbKeys || "DB Keys"}
                    value={models.filter((m) => m.model_info.db_model).length}
                    icon={<KeyRound className="w-5 h-5" />}
                />
                <StatCard
                    label={t.configKeys || "Config Keys"}
                    value={models.filter((m) => !m.model_info.db_model).length}
                    icon={<KeyRound className="w-5 h-5" />}
                />
            </div>

            {/* Table */}
            {models.length === 0 ? (
                <div className="text-center py-12 text-text-tertiary">
                    <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{t.noKeys || "No keys configured yet"}</p>
                </div>
            ) : (
                <KeysTable models={models} t={t} onDelete={setDeleteTarget} />
            )}

            {/* Add Key Dialog */}
            {dialogOpen && <AddKeyDialog t={t} onClose={() => setDialogOpen(false)} onSuccess={handleAddSuccess} />}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <DeleteConfirmDialog
                    model={deleteTarget}
                    t={t}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={() => handleDelete(deleteTarget)}
                />
            )}
        </div>
    );
}

// ──────────────────────────── Stat Card ────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="p-4 rounded-lg bg-bg-secondary border border-border-default">
            <div className="flex items-center gap-3">
                <div className="text-text-tertiary">{icon}</div>
                <div>
                    <p className="text-2xl font-bold text-text-primary">{value}</p>
                    <p className="text-xs text-text-tertiary">{label}</p>
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────── Table ────────────────────────────

function KeysTable({
    models,
    t,
    onDelete,
}: {
    models: KeyModel[];
    t: Labels;
    onDelete: (model: KeyModel) => void;
}) {
    return (
        <div className="rounded-lg border border-border-default overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-bg-secondary border-b border-border-default">
                            <th className="text-left px-4 py-3 font-medium text-text-secondary">{t.provider || "Provider"}</th>
                            <th className="text-left px-4 py-3 font-medium text-text-secondary">{t.modelName || "Model Alias"}</th>
                            <th className="text-left px-4 py-3 font-medium text-text-secondary">{t.model || "Model"}</th>
                            <th className="text-left px-4 py-3 font-medium text-text-secondary">{t.apiKey || "API Key"}</th>
                            <th className="text-left px-4 py-3 font-medium text-text-secondary">{t.source || "Source"}</th>
                            <th className="text-right px-4 py-3 font-medium text-text-secondary">{t.actions || "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((model) => (
                            <KeyRow key={model.model_info.id} model={model} t={t} onDelete={onDelete} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function KeyRow({
    model,
    t,
    onDelete,
}: {
    model: KeyModel;
    t: Labels;
    onDelete: (model: KeyModel) => void;
}) {
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const fullModel = model.litellm_params.model;
    const apiKey = (model.litellm_params.api_key as string) || "";

    function handleCopy() {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <tr className="border-b border-border-default hover:bg-bg-hover/50 transition-colors">
            {/* Provider */}
            <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getProviderColor(fullModel)}`}>
                    {getProviderName(fullModel)}
                </span>
            </td>
            {/* Model Alias */}
            <td className="px-4 py-3 text-text-primary font-medium">{model.model_name}</td>
            {/* Full Model */}
            <td className="px-4 py-3 text-text-secondary font-mono text-xs">{fullModel}</td>
            {/* API Key */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <code className="text-xs text-text-tertiary font-mono">
                        {showKey ? apiKey : maskKey(apiKey)}
                    </code>
                    <button
                        onClick={() => setShowKey(!showKey)}
                        className="p-1 rounded text-text-tertiary hover:text-text-secondary transition-colors"
                        title={showKey ? "Hide" : "Show"}
                    >
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1 rounded text-text-tertiary hover:text-text-secondary transition-colors"
                        title="Copy"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </td>
            {/* Source */}
            <td className="px-4 py-3">
                <span
                    className={`text-xs px-2 py-0.5 rounded-full ${model.model_info.db_model
                            ? "bg-accent/15 text-accent"
                            : "bg-gray-500/15 text-gray-400"
                        }`}
                >
                    {model.model_info.db_model ? "Database" : "Config"}
                </span>
            </td>
            {/* Actions */}
            <td className="px-4 py-3 text-right">
                {model.model_info.db_model ? (
                    <button
                        onClick={() => onDelete(model)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t.delete || "Delete"}
                    </button>
                ) : (
                    <span className="text-xs text-text-tertiary">{t.configOnly || "Config file"}</span>
                )}
            </td>
        </tr>
    );
}

// ──────────────────────────── Add Key Dialog ────────────────────────────

function AddKeyDialog({
    t,
    onClose,
    onSuccess,
}: {
    t: Labels;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [alias, setAlias] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const provider = PROVIDERS.find((p) => p.id === selectedProvider);

    // Auto-set alias when model changes
    useEffect(() => {
        if (selectedModel && selectedProvider) {
            const shortModel = selectedModel.split("/").pop() || selectedModel;
            setAlias(shortModel);
        }
    }, [selectedModel, selectedProvider]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedProvider || !selectedModel || !apiKey) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model_name: alias || selectedModel,
                    litellm_params: {
                        model: `${selectedProvider}/${selectedModel}`,
                        api_key: apiKey,
                    },
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to add key");
            }

            onSuccess();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* Dialog */}
            <div className="relative w-full max-w-lg mx-4 bg-bg-secondary rounded-xl border border-border-default shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border-default">
                    <h3 className="text-lg font-bold text-text-primary">{t.addKey || "Add API Key"}</h3>
                    <p className="text-sm text-text-tertiary mt-1">
                        {t.addKeyDesc || "Add a new provider API key to LiteLLM"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Provider */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            {t.provider || "Provider"}
                        </label>
                        <select
                            value={selectedProvider}
                            onChange={(e) => {
                                setSelectedProvider(e.target.value);
                                setSelectedModel("");
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                            required
                        >
                            <option value="">{t.selectProvider || "Select provider..."}</option>
                            {PROVIDERS.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Model */}
                    {provider && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                {t.model || "Model"}
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                                required
                            >
                                <option value="">{t.selectModel || "Select model..."}</option>
                                {provider.models.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Alias */}
                    {selectedModel && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                {t.alias || "Alias (model name in API)"}
                            </label>
                            <input
                                type="text"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                placeholder="e.g. gemini-flash"
                                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                            />
                        </div>
                    )}

                    {/* API Key */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            {t.apiKey || "API Key"}
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-... / AIza..."
                            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-default text-text-primary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
                            required
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-hover transition-colors"
                        >
                            {t.cancel || "Cancel"}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedProvider || !selectedModel || !apiKey}
                            className="px-4 py-2 rounded-lg text-sm bg-accent text-white hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t.adding || "Adding..." : t.addKey || "Add Key"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ──────────────────────────── Delete Confirm ────────────────────────────

function DeleteConfirmDialog({
    model,
    t,
    onClose,
    onConfirm,
}: {
    model: KeyModel;
    t: Labels;
    onClose: () => void;
    onConfirm: () => void;
}) {
    const [loading, setLoading] = useState(false);

    async function handleConfirm() {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-md mx-4 bg-bg-secondary rounded-xl border border-border-default shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-text-primary mb-2">{t.confirmDelete || "Delete Key?"}</h3>
                <p className="text-sm text-text-tertiary mb-1">
                    {t.deleteWarning || "This will remove the key from LiteLLM. Requests using this model will fail."}
                </p>
                <div className="p-3 rounded-lg bg-bg-primary border border-border-default mt-3 mb-4">
                    <p className="text-sm font-medium text-text-primary">{model.model_name}</p>
                    <p className="text-xs text-text-tertiary font-mono">{model.litellm_params.model}</p>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-hover transition-colors"
                    >
                        {t.cancel || "Cancel"}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? t.deleting || "Deleting..." : t.delete || "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
