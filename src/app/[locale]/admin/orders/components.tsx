"use client";

import { useState } from "react";
import { updateOrderStatus, deleteOrder } from "./actions";
import { RefreshCw, Trash2, X } from "lucide-react";

/* ─── Update Status Button ─── */
export function UpdateStatusButton({
    order,
    labels,
}: {
    order: { id: string; status: string };
    labels: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)} className="action-btn" title={labels.updateStatus}>
                <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {open && (
                <Modal onClose={() => setOpen(false)} title={labels.updateStatus}>
                    <form
                        action={async (fd) => {
                            await updateOrderStatus(fd);
                            setOpen(false);
                        }}
                        className="space-y-4"
                    >
                        <input type="hidden" name="id" value={order.id} />
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Status</label>
                            <select name="status" defaultValue={order.status} className="input-field">
                                <option value="pending">{labels.pending}</option>
                                <option value="paid">{labels.paid}</option>
                                <option value="cancelled">{labels.cancelled}</option>
                                <option value="refunded">{labels.refunded}</option>
                            </select>
                        </div>
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

/* ─── Delete Order Button ─── */
export function DeleteOrderButton({
    orderId,
    labels,
}: {
    orderId: string;
    labels: Record<string, string>;
}) {
    const [confirming, setConfirming] = useState(false);

    if (confirming) {
        return (
            <div className="flex items-center gap-1">
                <form action={async (fd) => { await deleteOrder(fd); setConfirming(false); }}>
                    <input type="hidden" name="id" value={orderId} />
                    <button type="submit" className="text-xs px-2 py-1 rounded bg-error/20 text-error hover:bg-error/30 transition-colors cursor-pointer">
                        {labels.confirm}
                    </button>
                </form>
                <button onClick={() => setConfirming(false)} className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer">
                    {labels.cancel}
                </button>
            </div>
        );
    }

    return (
        <button onClick={() => setConfirming(true)} className="action-btn text-error" title={labels.deleteOrder}>
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}

/* ─── Shared Modal ─── */
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-bg-secondary border border-border-default rounded-xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
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
