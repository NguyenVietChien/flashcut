"use client";

import { useState } from "react";
import { createProduct, updateProduct, deleteProduct, createPlan, updatePlan, deletePlan } from "./actions";
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, Package, Star, Eye } from "lucide-react";

type DisplayData = {
    id: string;
    taglineVi: string | null;
    taglineEn: string | null;
    highlightVi: string | null;
    highlightEn: string | null;
    ctaVi: string | null;
    ctaEn: string | null;
    emoji: string | null;
    sortOrder: number;
    isFeatured: boolean;
};

type PlanData = {
    id: string;
    slug: string;
    name: string;
    priceVnd: number;
    priceUsd: number | null;
    durationDays: number | null;
    maxActivations: number;
    usageLimit: number | null;
    isActive: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    features: any;
    display: DisplayData | null;
};

type ProductData = {
    id: string;
    slug: string;
    name: string;
    type: string;
    description: string | null;
    isActive: boolean;
    plans: PlanData[];
    _count: { orders: number; licenses: number };
};

/* ─── Format VND ─── */
function formatVnd(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

/* ─── Modal ─── */
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-bg-secondary border border-border-default rounded-xl w-full max-w-lg mx-4 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-default sticky top-0 bg-bg-secondary z-10">
                    <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-hover text-text-tertiary transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

/* ─── Form Field ─── */
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
            {children}
            {hint && <p className="text-xs text-text-tertiary mt-1">{hint}</p>}
        </div>
    );
}

/* ─── Create Product Button ─── */
export function CreateProductButton({ labels }: { labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <>
            <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {labels.addProduct}
            </button>

            {open && (
                <Modal onClose={() => { setOpen(false); setError(null); }} title={labels.addProduct}>
                    <form
                        action={async (fd) => {
                            const res = await createProduct(fd);
                            if (res.error) { setError(res.error); return; }
                            setOpen(false);
                            setError(null);
                        }}
                        className="space-y-4"
                    >
                        {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}
                        <Field label={labels.productName}>
                            <input name="name" required className="input-field" placeholder="FlashCut Desktop" />
                        </Field>
                        <Field label="Slug" hint={labels.slugHint}>
                            <input name="slug" required className="input-field" placeholder="flashcut-desktop" pattern="[a-z0-9\-]+" />
                        </Field>
                        <Field label={labels.productType}>
                            <select name="type" className="input-field" defaultValue="desktop">
                                <option value="desktop">Desktop</option>
                                <option value="web">Web</option>
                                <option value="module">Module</option>
                            </select>
                        </Field>
                        <Field label={labels.description}>
                            <textarea name="description" className="input-field" rows={2} placeholder={labels.descriptionPlaceholder} />
                        </Field>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setOpen(false)} className="btn-cancel">{labels.cancel}</button>
                            <button type="submit" className="btn-primary">{labels.save}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}

/* ─── Edit Product Button ─── */
export function EditProductButton({ product, labels }: { product: ProductData; labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <>
            <button onClick={() => setOpen(true)} className="action-btn" title={labels.editProduct}>
                <Pencil className="w-3.5 h-3.5" />
            </button>

            {open && (
                <Modal onClose={() => { setOpen(false); setError(null); }} title={labels.editProduct}>
                    <form
                        action={async (fd) => {
                            const res = await updateProduct(fd);
                            if (res.error) { setError(res.error); return; }
                            setOpen(false);
                            setError(null);
                        }}
                        className="space-y-4"
                    >
                        <input type="hidden" name="id" value={product.id} />
                        {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}
                        <Field label={labels.productName}>
                            <input name="name" required defaultValue={product.name} className="input-field" />
                        </Field>
                        <Field label="Slug">
                            <input name="slug" required defaultValue={product.slug} className="input-field" pattern="[a-z0-9\-]+" />
                        </Field>
                        <Field label={labels.productType}>
                            <select name="type" className="input-field" defaultValue={product.type}>
                                <option value="desktop">Desktop</option>
                                <option value="web">Web</option>
                                <option value="module">Module</option>
                            </select>
                        </Field>
                        <Field label={labels.description}>
                            <textarea name="description" className="input-field" rows={2} defaultValue={product.description || ""} />
                        </Field>
                        <Field label={labels.status}>
                            <select name="isActive" className="input-field" defaultValue={product.isActive ? "true" : "false"}>
                                <option value="true">{labels.active}</option>
                                <option value="false">{labels.inactive}</option>
                            </select>
                        </Field>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setOpen(false)} className="btn-cancel">{labels.cancel}</button>
                            <button type="submit" className="btn-primary">{labels.save}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}

/* ─── Delete Product Button ─── */
export function DeleteProductButton({ product, labels }: { product: ProductData; labels: Record<string, string> }) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasData = product._count.orders > 0 || product._count.licenses > 0;

    if (confirming) {
        return (
            <div className="flex items-center gap-1">
                {error && <span className="text-xs text-error mr-1">{error}</span>}
                <form action={async (fd) => {
                    const res = await deleteProduct(fd);
                    if (res.error) { setError(res.error); return; }
                    setConfirming(false);
                }}>
                    <input type="hidden" name="id" value={product.id} />
                    <button type="submit" className="text-xs px-2 py-1 rounded bg-error/20 text-error hover:bg-error/30 transition-colors cursor-pointer">
                        {labels.confirm}
                    </button>
                </form>
                <button onClick={() => { setConfirming(false); setError(null); }} className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer">
                    {labels.cancel}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className={`action-btn text-error ${hasData ? "opacity-40 cursor-not-allowed" : ""}`}
            title={hasData ? labels.cannotDelete : labels.deleteProduct}
            disabled={hasData}
        >
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}

/* ─── Product Row (expandable with plans) ─── */
export function ProductRow({ product, labels }: { product: ProductData; labels: Record<string, string> }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-bg-hover transition-colors">
                <td className="px-6 py-4">
                    <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 cursor-pointer">
                        {expanded ? <ChevronDown className="w-4 h-4 text-text-tertiary" /> : <ChevronRight className="w-4 h-4 text-text-tertiary" />}
                        <Package className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-text-primary">{product.name}</span>
                    </button>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary font-mono">{product.slug}</td>
                <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.type === "desktop" ? "bg-blue-500/20 text-blue-400" :
                        product.type === "web" ? "bg-green-500/20 text-green-400" :
                            "bg-purple-500/20 text-purple-400"
                        }`}>
                        {product.type}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{product.plans.length}</td>
                <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {product.isActive ? labels.active : labels.inactive}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <EditProductButton product={product} labels={labels} />
                        <DeleteProductButton product={product} labels={labels} />
                    </div>
                </td>
            </tr>

            {/* Plans sub-table */}
            {expanded && (
                <tr>
                    <td colSpan={6} className="px-0 py-0">
                        <div className="bg-bg-primary/50 border-y border-border-default">
                            <div className="px-12 py-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-text-secondary">{labels.plans} ({product.plans.length})</h4>
                                    <AddPlanButton productId={product.id} labels={labels} />
                                </div>
                                {product.plans.length > 0 ? (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border-default/50">
                                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-4 py-2">{labels.planName}</th>
                                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-4 py-2">Slug</th>
                                                <th className="text-right text-xs font-medium text-text-tertiary uppercase tracking-wider px-4 py-2">{labels.priceVnd}</th>
                                                <th className="text-center text-xs font-medium text-text-tertiary uppercase tracking-wider px-4 py-2">{labels.duration}</th>
                                                <th className="text-center text-xs font-medium text-text-tertiary uppercase tracking-wider px-4 py-2">{labels.status}</th>
                                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-4 py-2">{labels.actions}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-default/30">
                                            {product.plans.map((plan) => (
                                                <PlanRow key={plan.id} plan={plan} productId={product.id} labels={labels} />
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-sm text-text-tertiary italic py-2">{labels.noPlans}</p>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

/* ─── Plan Row ─── */
function PlanRow({ plan, productId, labels }: { plan: PlanData; productId: string; labels: Record<string, string> }) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <>
            <tr className="hover:bg-bg-hover/50 transition-colors">
                <td className="px-4 py-2.5 text-sm text-text-primary">
                    <div className="flex items-center gap-2">
                        {plan.display?.emoji && <span>{plan.display.emoji}</span>}
                        <span>{plan.name}</span>
                        {plan.display?.isFeatured && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        )}
                    </div>
                </td>
                <td className="px-4 py-2.5 text-sm text-text-secondary font-mono">{plan.slug}</td>
                <td className="px-4 py-2.5 text-sm text-text-primary text-right font-medium">{formatVnd(plan.priceVnd)}</td>
                <td className="px-4 py-2.5 text-sm text-text-secondary text-center">
                    {plan.durationDays ? `${plan.durationDays} ${labels.days}` : "♾️ Lifetime"}
                </td>
                <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${plan.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {plan.isActive ? labels.active : labels.inactive}
                    </span>
                </td>
                <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(true)} className="action-btn" title={labels.editPlan}>
                            <Pencil className="w-3 h-3" />
                        </button>
                        {deleting ? (
                            <div className="flex items-center gap-1">
                                <form action={async (fd) => { await deletePlan(fd); setDeleting(false); }}>
                                    <input type="hidden" name="id" value={plan.id} />
                                    <button type="submit" className="text-xs px-1.5 py-0.5 rounded bg-error/20 text-error hover:bg-error/30 transition-colors cursor-pointer">{labels.confirm}</button>
                                </form>
                                <button onClick={() => setDeleting(false)} className="text-xs px-1.5 py-0.5 rounded bg-bg-tertiary text-text-secondary cursor-pointer">{labels.cancel}</button>
                            </div>
                        ) : (
                            <button onClick={() => setDeleting(true)} className="action-btn text-error" title={labels.deletePlan}>
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </td>
            </tr>

            {editing && (
                <tr>
                    <td colSpan={6} className="p-0">
                        <Modal onClose={() => { setEditing(false); setError(null); }} title={labels.editPlan}>
                            <PlanForm
                                productId={productId}
                                plan={plan}
                                labels={labels}
                                error={error}
                                onSubmit={async (fd) => {
                                    const res = await updatePlan(fd);
                                    if (res.error) { setError(res.error); return; }
                                    setEditing(false);
                                    setError(null);
                                }}
                                onCancel={() => { setEditing(false); setError(null); }}
                            />
                        </Modal>
                    </td>
                </tr>
            )}
        </>
    );
}

/* ─── Add Plan Button ─── */
function AddPlanButton({ productId, labels }: { productId: string; labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <>
            <button onClick={() => setOpen(true)} className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer">
                <Plus className="w-3 h-3" />
                {labels.addPlan}
            </button>

            {open && (
                <Modal onClose={() => { setOpen(false); setError(null); }} title={labels.addPlan}>
                    <PlanForm
                        productId={productId}
                        labels={labels}
                        error={error}
                        onSubmit={async (fd) => {
                            const res = await createPlan(fd);
                            if (res.error) { setError(res.error); return; }
                            setOpen(false);
                            setError(null);
                        }}
                        onCancel={() => { setOpen(false); setError(null); }}
                    />
                </Modal>
            )}
        </>
    );
}

/* ─── Plan Form (reused for create + edit) ─── */
function PlanForm({
    productId,
    plan,
    labels,
    error,
    onSubmit,
    onCancel,
}: {
    productId: string;
    plan?: PlanData;
    labels: Record<string, string>;
    error: string | null;
    onSubmit: (fd: FormData) => Promise<void>;
    onCancel: () => void;
}) {
    return (
        <form action={onSubmit} className="space-y-4">
            <input type="hidden" name="productId" value={productId} />
            {plan && <input type="hidden" name="id" value={plan.id} />}
            {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}

            {/* ─── Core plan fields ─── */}
            <div className="grid grid-cols-2 gap-4">
                <Field label={labels.planName}>
                    <input name="name" required defaultValue={plan?.name} className="input-field" placeholder="Pro Monthly" />
                </Field>
                <Field label="Slug">
                    <input name="slug" required defaultValue={plan?.slug} className="input-field" placeholder="pro-monthly" pattern="[a-z0-9\-]+" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label={labels.priceVnd}>
                    <input name="priceVnd" type="number" required defaultValue={plan?.priceVnd} className="input-field" placeholder="499000" />
                </Field>
                <Field label={`${labels.priceUsd} (USD)`} hint={labels.optional}>
                    <input name="priceUsd" type="number" defaultValue={plan?.priceUsd || ""} className="input-field" placeholder="20" />
                </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Field label={labels.duration} hint={labels.durationHint}>
                    <input name="durationDays" type="number" defaultValue={plan?.durationDays || ""} className="input-field" placeholder="30" />
                </Field>
                <Field label={labels.maxActivations}>
                    <input name="maxActivations" type="number" defaultValue={plan?.maxActivations || 1} className="input-field" />
                </Field>
                <Field label={labels.usageLimit} hint={labels.usageLimitHint}>
                    <input name="usageLimit" type="number" defaultValue={plan?.usageLimit || ""} className="input-field" placeholder="∞" />
                </Field>
            </div>

            {plan && (
                <Field label={labels.status}>
                    <select name="isActive" className="input-field" defaultValue={plan.isActive ? "true" : "false"}>
                        <option value="true">{labels.active}</option>
                        <option value="false">{labels.inactive}</option>
                    </select>
                </Field>
            )}

            {/* ─── Display / Pricing Page ─── */}
            <div className="border-t border-border-default pt-4 mt-4">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-4 h-4 text-accent" />
                    <h4 className="text-sm font-semibold text-text-primary">Landing Page Display</h4>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Field label="Emoji" hint="⚡ 🚀 👑">
                        <input name="emoji" defaultValue={plan?.display?.emoji || ""} className="input-field" placeholder="🚀" />
                    </Field>
                    <Field label="Sort Order" hint="0, 1, 2...">
                        <input name="sortOrder" type="number" defaultValue={plan?.display?.sortOrder ?? 0} className="input-field" />
                    </Field>
                    <Field label="Featured">
                        <select name="isFeatured" className="input-field" defaultValue={plan?.display?.isFeatured ? "true" : "false"}>
                            <option value="false">No</option>
                            <option value="true">⭐ Yes — Most Popular</option>
                        </select>
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Field label="Tagline (VI)">
                        <input name="taglineVi" defaultValue={plan?.display?.taglineVi || ""} className="input-field" placeholder="Có kịch bản? 1 click ra video" />
                    </Field>
                    <Field label="Tagline (EN)">
                        <input name="taglineEn" defaultValue={plan?.display?.taglineEn || ""} className="input-field" placeholder="Got a script? One click to video" />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Field label="Highlight (VI)" hint="Badge phụ">
                        <input name="highlightVi" defaultValue={plan?.display?.highlightVi || ""} className="input-field" placeholder="Tất cả Basic, thêm" />
                    </Field>
                    <Field label="Highlight (EN)">
                        <input name="highlightEn" defaultValue={plan?.display?.highlightEn || ""} className="input-field" placeholder="Everything in Basic, plus" />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Field label="CTA Button (VI)">
                        <input name="ctaVi" defaultValue={plan?.display?.ctaVi || ""} className="input-field" placeholder="Nâng Cấp Ngay" />
                    </Field>
                    <Field label="CTA Button (EN)">
                        <input name="ctaEn" defaultValue={plan?.display?.ctaEn || ""} className="input-field" placeholder="Upgrade Now" />
                    </Field>
                </div>
            </div>

            {/* ─── Features JSON ─── */}
            <PlanFeaturesEditor features={plan?.features} />

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="btn-cancel">{labels.cancel}</button>
                <button type="submit" className="btn-primary">{labels.save}</button>
            </div>
        </form>
    );
}

/* ─── Features JSON Editor ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PlanFeaturesEditor({ features }: { features?: any }) {
    const [expanded, setExpanded] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [value, setValue] = useState(() => {
        if (!features) return "";
        try { return JSON.stringify(features, null, 2); } catch { return ""; }
    });

    const handleChange = (v: string) => {
        setValue(v);
        if (!v.trim()) { setJsonError(null); return; }
        try {
            const parsed = JSON.parse(v);
            if (!parsed.vi || !parsed.en) {
                setJsonError("Must have 'vi' and 'en' keys");
            } else {
                setJsonError(null);
            }
        } catch {
            setJsonError("Invalid JSON");
        }
    };

    return (
        <div className="border-t border-border-default pt-4 mt-4">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Features JSON
                {value && <span className="text-xs text-text-tertiary font-normal">(has data)</span>}
            </button>

            {expanded && (
                <div className="mt-3 space-y-2">
                    <p className="text-xs text-text-tertiary">
                        Format: {`{ "vi": [{ "group": "...", "icon": "film", "items": ["..."] }], "en": [...] }`}
                    </p>
                    <textarea
                        name="features"
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        className={`input-field font-mono text-xs ${jsonError ? "!border-error" : ""}`}
                        rows={12}
                        placeholder='{ "vi": [...], "en": [...] }'
                        spellCheck={false}
                    />
                    {jsonError && (
                        <p className="text-xs text-error">{jsonError}</p>
                    )}
                    {!jsonError && value && (
                        <p className="text-xs text-success">✓ Valid JSON</p>
                    )}
                </div>
            )}

            {/* Hidden input to submit the value even when collapsed */}
            {!expanded && <input type="hidden" name="features" value={value} />}
        </div>
    );
}
