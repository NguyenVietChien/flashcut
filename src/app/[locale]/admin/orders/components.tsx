"use client";

import { useState } from "react";
import { updateOrderStatus, deleteOrder, createAdminOrder } from "./actions";
import { Plus, RefreshCw, Copy, Check } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
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

/* ─── Types ─── */
interface QrData {
    orderCode: string;
    qrUrl: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

/* ─── Create Order Button ─── */
export function CreateOrderButton({
    plans,
    labels,
}: {
    plans: { slug: string; name: string; priceVnd: number }[];
    labels: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);
    const [qrData, setQrData] = useState<QrData | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const reset = () => { setQrData(null); setCopied(null); };

    const copyText = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat("vi-VN").format(amount) + " ₫";

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
                <Button className="bg-accent text-black hover:bg-accent-hover">
                    <Plus className="w-4 h-4" />
                    {labels.createOrder}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{qrData ? labels.orderCreated : labels.createOrder}</DialogTitle>
                </DialogHeader>

                {!qrData ? (
                    /* ── Form Phase ── */
                    <form
                        action={async (fd) => {
                            const result = await createAdminOrder(fd);
                            if ("qrUrl" in result && result.qrUrl) {
                                setQrData({
                                    orderCode: result.orderCode!,
                                    qrUrl: result.qrUrl,
                                    amount: result.amount!,
                                    bankName: result.bankName!,
                                    accountNumber: result.accountNumber!,
                                    accountHolder: result.accountHolder!,
                                });
                            }
                        }}
                        className="space-y-4"
                    >
                        <Field label={labels.selectPlan}>
                            <Select name="plan" required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={labels.selectPlan} />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map((p) => (
                                        <SelectItem key={p.slug} value={p.slug}>
                                            {p.name} — {formatAmount(p.priceVnd)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label={`${labels.buyerEmail} (${labels.optional})`}>
                            <Input type="email" name="buyerEmail" placeholder={labels.buyerEmailPlaceholder} />
                        </Field>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" className="border-border-default text-text-secondary hover:bg-bg-hover">
                                    {labels.cancel}
                                </Button>
                            </DialogClose>
                            <SubmitButton className="bg-accent text-black hover:bg-accent-hover">
                                {labels.create}
                            </SubmitButton>
                        </DialogFooter>
                    </form>
                ) : (
                    /* ── QR Display Phase ── */
                    <div className="space-y-4">
                        <div className="flex flex-col items-center">
                            <p className="text-text-secondary text-sm mb-3">{labels.qrScanToPay}</p>
                            <img
                                src={qrData.qrUrl}
                                alt="QR Code"
                                className="w-48 h-48 rounded-lg bg-white p-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <InfoRow label={labels.bank} value={qrData.bankName} onCopy={() => copyText(qrData.bankName, "bank")} copied={copied === "bank"} />
                            <InfoRow label={labels.accountNumber} value={qrData.accountNumber} onCopy={() => copyText(qrData.accountNumber, "acc")} copied={copied === "acc"} />
                            <InfoRow label={labels.accountHolder} value={qrData.accountHolder} onCopy={() => copyText(qrData.accountHolder, "holder")} copied={copied === "holder"} />
                            <InfoRow label={labels.amount} value={formatAmount(qrData.amount)} onCopy={() => copyText(qrData.amount.toString(), "amount")} copied={copied === "amount"} />
                            <InfoRow label={labels.transferContent} value={qrData.orderCode} onCopy={() => copyText(qrData.orderCode, "code")} copied={copied === "code"} highlight />
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="border-border-default text-text-secondary hover:bg-bg-hover"
                                onClick={() => copyText(qrData.qrUrl, "qr")}
                            >
                                {copied === "qr" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied === "qr" ? labels.copiedToClipboard : labels.copyQrUrl}
                            </Button>
                            <DialogClose asChild>
                                <Button className="bg-accent text-black hover:bg-accent-hover">{labels.close}</Button>
                            </DialogClose>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* ─── Shared InfoRow ─── */
function InfoRow({ label, value, onCopy, copied, highlight }: {
    label: string; value: string; onCopy: () => void; copied: boolean; highlight?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between p-2.5 rounded-lg border ${highlight ? "border-accent/50 bg-accent/5" : "border-border-default bg-bg-secondary"}`}>
            <div>
                <p className="text-text-tertiary text-xs">{label}</p>
                <p className={`font-medium text-sm ${highlight ? "text-accent" : "text-text-primary"}`}>{value}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCopy} className="h-7 w-7 shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-tertiary" />}
            </Button>
        </div>
    );
}

/* ─── Update Status Button ─── */
export function UpdateStatusButton({
    order,
    labels,
}: {
    order: { id: string; status: string };
    labels: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(order.status);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="action-btn" title={labels.updateStatus}>
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{labels.updateStatus}</DialogTitle>
                </DialogHeader>
                <form
                    action={async (fd) => {
                        await updateOrderStatus(fd);
                        setOpen(false);
                    }}
                    className="space-y-4"
                    autoComplete="off"
                >
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="status" value={status} />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">{labels.pending}</SelectItem>
                                <SelectItem value="paid">{labels.paid}</SelectItem>
                                <SelectItem value="cancelled">{labels.cancelled}</SelectItem>
                                <SelectItem value="refunded">{labels.refunded}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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

/* ─── Delete Order Button ─── */
export function DeleteOrderButton({
    orderId,
    labels,
}: {
    orderId: string;
    labels: Record<string, string>;
}) {
    return (
        <ConfirmDeleteDialog
            title={labels.deleteOrder}
            description="Are you sure you want to delete this order? This action cannot be undone."
            action={deleteOrder}
            hiddenFields={{ id: orderId }}
            labels={{ cancel: labels.cancel, confirm: labels.confirm }}
        />
    );
}
