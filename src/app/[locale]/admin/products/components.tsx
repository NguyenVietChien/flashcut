"use client";

import { useState } from "react";
import { createProduct, updateProduct, deleteProduct, createPlan, updatePlan, deletePlan } from "./actions";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Package, Star, Eye } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/Field";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { NumberInput } from "@/components/admin/NumberInput";

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



/* ─── Create Product Button ─── */
export function CreateProductButton({ labels }: { labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productType, setProductType] = useState("desktop");

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(null); setProductType("desktop"); } }}>
            <DialogTrigger asChild>
                <Button className="bg-accent text-black hover:bg-accent-hover gap-2">
                    <Plus className="w-4 h-4" />
                    {labels.addProduct}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{labels.addProduct}</DialogTitle>
                </DialogHeader>
                <form
                    action={async (fd) => {
                        const res = await createProduct(fd);
                        if (res.error) { setError(res.error); return; }
                        setOpen(false);
                        setError(null);
                    }}
                    className="space-y-4"
                    autoComplete="off"
                >
                    <input type="hidden" name="type" value={productType} />
                    {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}
                    <Field label={labels.productName}>
                        <Input name="name" required placeholder="FlashCut Desktop" />
                    </Field>
                    <Field label="Slug" hint={labels.slugHint}>
                        <Input name="slug" required placeholder="flashcut-desktop" pattern="[a-z0-9\-]+" />
                    </Field>
                    <Field label={labels.productType}>
                        <Select value={productType} onValueChange={setProductType}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desktop">Desktop</SelectItem>
                                <SelectItem value="web">Web</SelectItem>
                                <SelectItem value="module">Module</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label={labels.description}>
                        <textarea name="description" className="w-full rounded-md border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" rows={2} placeholder={labels.descriptionPlaceholder} />
                    </Field>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="border-border-default text-text-secondary hover:bg-bg-hover">
                                {labels.cancel}
                            </Button>
                        </DialogClose>
                        <SubmitButton className="bg-accent text-black hover:bg-accent-hover">
                            {labels.save}
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Edit Product Button ─── */
export function EditProductButton({ product, labels }: { product: ProductData; labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productType, setProductType] = useState(product.type);
    const [isActive, setIsActive] = useState(product.isActive ? "true" : "false");

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(null); setProductType(product.type); setIsActive(product.isActive ? "true" : "false"); } }}>
            <DialogTrigger asChild>
                <button className="action-btn" title={labels.editProduct}>
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{labels.editProduct}</DialogTitle>
                </DialogHeader>
                <form
                    action={async (fd) => {
                        const res = await updateProduct(fd);
                        if (res.error) { setError(res.error); return; }
                        setOpen(false);
                        setError(null);
                    }}
                    className="space-y-4"
                    autoComplete="off"
                >
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="type" value={productType} />
                    <input type="hidden" name="isActive" value={isActive} />
                    {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}
                    <Field label={labels.productName}>
                        <Input name="name" required defaultValue={product.name} />
                    </Field>
                    <Field label="Slug">
                        <Input name="slug" required defaultValue={product.slug} pattern="[a-z0-9\-]+" />
                    </Field>
                    <Field label={labels.productType}>
                        <Select value={productType} onValueChange={setProductType}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desktop">Desktop</SelectItem>
                                <SelectItem value="web">Web</SelectItem>
                                <SelectItem value="module">Module</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label={labels.description}>
                        <textarea name="description" className="w-full rounded-md border border-border-default bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" rows={2} defaultValue={product.description || ""} />
                    </Field>
                    <Field label={labels.status}>
                        <Select value={isActive} onValueChange={setIsActive}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">{labels.active}</SelectItem>
                                <SelectItem value="false">{labels.inactive}</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="border-border-default text-text-secondary hover:bg-bg-hover">
                                {labels.cancel}
                            </Button>
                        </DialogClose>
                        <SubmitButton className="bg-accent text-black hover:bg-accent-hover">
                            {labels.save}
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Delete Product Button ─── */
export function DeleteProductButton({ product, labels }: { product: ProductData; labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasData = product._count.orders > 0 || product._count.licenses > 0;

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(null); }}>
            <DialogTrigger asChild>
                <button
                    className={`action-btn text-error ${hasData ? "opacity-40 cursor-not-allowed" : ""}`}
                    title={hasData ? labels.cannotDelete : labels.deleteProduct}
                    disabled={hasData}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{labels.deleteProduct}</DialogTitle>
                </DialogHeader>
                {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}
                <p className="text-sm text-text-secondary">Permanently delete <strong>{product.name}</strong>? This cannot be undone.</p>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="border-border-default text-text-secondary hover:bg-bg-hover">
                            {labels.cancel}
                        </Button>
                    </DialogClose>
                    <form action={async (fd) => {
                        const res = await deleteProduct(fd);
                        if (res.error) { setError(res.error); return; }
                        setOpen(false);
                    }}>
                        <input type="hidden" name="id" value={product.id} />
                        <SubmitButton variant="destructive">
                            {labels.confirm}
                        </SubmitButton>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
                                    <SubmitButton size="xs" className="bg-error/20 text-error hover:bg-error/30 transition-colors">{labels.confirm}</SubmitButton>
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
                        <Dialog open={editing} onOpenChange={(v) => { if (!v) { setEditing(false); setError(null); } }}>
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{labels.editPlan}</DialogTitle>
                                </DialogHeader>
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
                            </DialogContent>
                        </Dialog>
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
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(null); }}>
            <DialogTrigger asChild>
                <button className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer">
                    <Plus className="w-3 h-3" />
                    {labels.addPlan}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{labels.addPlan}</DialogTitle>
                </DialogHeader>
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
            </DialogContent>
        </Dialog>
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
    const [isActive, setIsActive] = useState(plan?.isActive ? "true" : "false");
    const [isFeatured, setIsFeatured] = useState(plan?.display?.isFeatured ? "true" : "false");

    return (
        <form action={onSubmit} className="space-y-4" autoComplete="off">
            <input type="hidden" name="productId" value={productId} />
            {plan && <input type="hidden" name="id" value={plan.id} />}
            <input type="hidden" name="isActive" value={isActive} />
            <input type="hidden" name="isFeatured" value={isFeatured} />
            {error && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>}

            {/* ─── Core plan fields ─── */}
            <div className="grid grid-cols-2 gap-4">
                <Field label={labels.planName}>
                    <Input name="name" required defaultValue={plan?.name} placeholder="Pro Monthly" />
                </Field>
                <Field label="Slug">
                    <Input name="slug" required defaultValue={plan?.slug} placeholder="pro-monthly" pattern="[a-z0-9\-]+" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label={labels.priceVnd}>
                    <NumberInput name="priceVnd" required defaultValue={plan?.priceVnd} placeholder="499000" step={1000} min={0} />
                </Field>
                <Field label={`${labels.priceUsd} (USD)`} hint={labels.optional}>
                    <NumberInput name="priceUsd" defaultValue={plan?.priceUsd || ""} placeholder="20" min={0} />
                </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Field label={labels.duration} hint={labels.durationHint}>
                    <NumberInput name="durationDays" defaultValue={plan?.durationDays || ""} placeholder="30" min={0} />
                </Field>
                <Field label={labels.maxActivations}>
                    <NumberInput name="maxActivations" defaultValue={plan?.maxActivations || 1} min={1} />
                </Field>
                <Field label={labels.usageLimit} hint={labels.usageLimitHint}>
                    <NumberInput name="usageLimit" defaultValue={plan?.usageLimit || ""} placeholder="∞" min={0} />
                </Field>
            </div>

            {plan && (
                <Field label={labels.status}>
                    <Select value={isActive} onValueChange={setIsActive}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">{labels.active}</SelectItem>
                            <SelectItem value="false">{labels.inactive}</SelectItem>
                        </SelectContent>
                    </Select>
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
                        <Input name="emoji" defaultValue={plan?.display?.emoji || ""} placeholder="🚀" />
                    </Field>
                    <Field label="Sort Order" hint="0, 1, 2...">
                        <NumberInput name="sortOrder" defaultValue={plan?.display?.sortOrder ?? 0} min={0} />
                    </Field>
                    <Field label="Featured">
                        <Select value={isFeatured} onValueChange={setIsFeatured}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="true">⭐ Yes — Most Popular</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Field label="Tagline (VI)">
                        <Input name="taglineVi" defaultValue={plan?.display?.taglineVi || ""} placeholder="Có kịch bản? 1 click ra video" />
                    </Field>
                    <Field label="Tagline (EN)">
                        <Input name="taglineEn" defaultValue={plan?.display?.taglineEn || ""} placeholder="Got a script? One click to video" />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Field label="Highlight (VI)" hint="Badge phụ">
                        <Input name="highlightVi" defaultValue={plan?.display?.highlightVi || ""} placeholder="Tất cả Basic, thêm" />
                    </Field>
                    <Field label="Highlight (EN)">
                        <Input name="highlightEn" defaultValue={plan?.display?.highlightEn || ""} placeholder="Everything in Basic, plus" />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Field label="CTA Button (VI)">
                        <Input name="ctaVi" defaultValue={plan?.display?.ctaVi || ""} placeholder="Nâng Cấp Ngay" />
                    </Field>
                    <Field label="CTA Button (EN)">
                        <Input name="ctaEn" defaultValue={plan?.display?.ctaEn || ""} placeholder="Upgrade Now" />
                    </Field>
                </div>
            </div>

            {/* ─── Features JSON ─── */}
            <PlanFeaturesEditor features={plan?.features} />

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={onCancel} className="border-border-default text-text-secondary hover:bg-bg-hover">
                        {labels.cancel}
                    </Button>
                </DialogClose>
                <SubmitButton className="bg-accent text-black hover:bg-accent-hover">
                    {labels.save}
                </SubmitButton>
            </DialogFooter>
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
                        className={`w-full bg-bg-secondary border border-border-default rounded-lg px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent font-mono text-xs ${jsonError ? "!border-error" : ""}`}
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
