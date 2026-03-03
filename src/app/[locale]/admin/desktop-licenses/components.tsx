"use client";

import { useState, useRef } from "react";
import { createLicense, updateLicense, resetHwid, deleteLicense } from "./actions";
import { Plus, Pencil, RotateCcw } from "lucide-react";
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
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

/* ─── Create License ─── */
export function CreateLicenseButton({ labels }: { labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    const [tier, setTier] = useState("basic");
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setTier("basic"); }}>
            <DialogTrigger asChild>
                <Button className="bg-accent text-black hover:bg-accent-hover gap-2">
                    <Plus className="w-4 h-4" />
                    {labels.createLicense}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{labels.createLicense}</DialogTitle>
                </DialogHeader>
                <form
                    ref={formRef}
                    action={async (fd) => {
                        await createLicense(fd);
                        setOpen(false);
                    }}
                    className="space-y-4"
                    autoComplete="off"
                >
                    <input type="hidden" name="tier" value={tier} />
                    <Field label="Tier">
                        <Select value={tier} onValueChange={setTier}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="basic">BASIC</SelectItem>
                                <SelectItem value="pro">PRO</SelectItem>
                                <SelectItem value="ultra">ULTRA</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label={labels.maxActivations}>
                        <Input type="number" name="maxActivations" defaultValue={1} min={1} max={10} />
                    </Field>
                    <Field label={labels.usageLimit}>
                        <Input type="number" name="usageLimit" defaultValue={-1} min={-1} />
                        <p className="text-xs text-text-tertiary mt-1">-1 = {labels.unlimited}</p>
                    </Field>
                    <Field label={labels.expiresInDays}>
                        <Input type="number" name="expiresInDays" defaultValue={30} min={1} />
                    </Field>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="border-border-default text-text-secondary hover:bg-bg-hover">
                                {labels.cancel}
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="bg-accent text-black hover:bg-accent-hover">
                            {labels.create}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Edit License ─── */
export function EditLicenseButton({
    license,
    labels,
}: {
    license: {
        id: string;
        tier: string;
        maxActivations: number;
        usageLimit: number;
        isActive: boolean;
    };
    labels: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);
    const [tier, setTier] = useState(license.tier);
    const [isActive, setIsActive] = useState(license.isActive ? "true" : "false");

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setTier(license.tier); setIsActive(license.isActive ? "true" : "false"); } }}>
            <DialogTrigger asChild>
                <button className="action-btn" title={labels.edit}>
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{labels.editLicense}</DialogTitle>
                </DialogHeader>
                <form
                    action={async (fd) => {
                        await updateLicense(fd);
                        setOpen(false);
                    }}
                    className="space-y-4"
                    autoComplete="off"
                >
                    <input type="hidden" name="id" value={license.id} />
                    <input type="hidden" name="tier" value={tier} />
                    <input type="hidden" name="isActive" value={isActive} />
                    <Field label="Tier">
                        <Select value={tier} onValueChange={setTier}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="basic">BASIC</SelectItem>
                                <SelectItem value="pro">PRO</SelectItem>
                                <SelectItem value="ultra">ULTRA</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label={labels.maxActivations}>
                        <Input type="number" name="maxActivations" defaultValue={license.maxActivations} min={1} max={10} />
                    </Field>
                    <Field label={labels.usageLimit}>
                        <Input type="number" name="usageLimit" defaultValue={license.usageLimit} min={-1} />
                        <p className="text-xs text-text-tertiary mt-1">-1 = {labels.unlimited}</p>
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
                    <Field label={labels.extendDays}>
                        <Input type="number" name="extendDays" defaultValue={0} min={0} />
                        <p className="text-xs text-text-tertiary mt-1">{labels.extendDaysHint}</p>
                    </Field>
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

/* ─── Reset HWID Button ─── */
export function ResetHwidButton({ licenseId, labels }: { licenseId: string; labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="action-btn" title={labels.resetHwid}>
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{labels.resetHwid}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-text-secondary">Reset hardware ID for this license? The user will need to re-activate.</p>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="border-border-default text-text-secondary hover:bg-bg-hover">
                            {labels.cancel}
                        </Button>
                    </DialogClose>
                    <form action={async (fd) => { await resetHwid(fd); setOpen(false); }}>
                        <input type="hidden" name="id" value={licenseId} />
                        <Button type="submit" className="bg-warning text-white hover:bg-warning/90">
                            {labels.confirm}
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Delete Button ─── */
export function DeleteLicenseButton({ licenseId, labels }: { licenseId: string; labels: Record<string, string> }) {
    return (
        <ConfirmDeleteDialog
            title={labels.delete}
            description="Permanently delete this license? This cannot be undone."
            action={deleteLicense}
            hiddenFields={{ id: licenseId }}
            labels={{ cancel: labels.cancel, confirm: labels.confirm }}
        />
    );
}
