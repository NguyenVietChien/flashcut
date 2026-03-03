"use client";

import { useState } from "react";
import { updateOrderStatus, deleteOrder } from "./actions";
import { RefreshCw } from "lucide-react";
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
                        <Button type="submit" className="bg-accent text-black hover:bg-accent-hover">
                            {labels.save}
                        </Button>
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
