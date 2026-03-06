"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Generic confirm-action dialog for admin delete operations.
 * Wraps the repeated pattern: trash icon → confirm modal → server action.
 */
export function ConfirmDeleteDialog({
    title,
    description,
    action,
    hiddenFields,
    labels,
    triggerClassName,
}: {
    title: string;
    description: string;
    action: (fd: FormData) => Promise<unknown>;
    hiddenFields: Record<string, string>;
    labels: { cancel: string; confirm: string };
    triggerClassName?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className={triggerClassName || "action-btn text-error"} title={title}>
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-text-secondary">{description}</p>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="border-border-default text-text-secondary hover:bg-bg-hover">
                            {labels.cancel}
                        </Button>
                    </DialogClose>
                    <form action={async (fd) => { await action(fd); setOpen(false); }}>
                        {Object.entries(hiddenFields).map(([name, value]) => (
                            <input key={name} type="hidden" name={name} value={value} />
                        ))}
                        <SubmitButton className="bg-error/15 text-error hover:bg-error/25 border border-error/30">
                            {labels.confirm}
                        </SubmitButton>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
