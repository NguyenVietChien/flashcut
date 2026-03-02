"use client";

import { useState, useRef } from "react";
import { createLicense, updateLicense, resetHwid, deleteLicense } from "./actions";
import { Plus, Pencil, RotateCcw, Trash2, X } from "lucide-react";

/* ─── Create Modal ─── */
export function CreateLicenseButton({ labels }: { labels: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-black text-sm font-semibold hover:brightness-110 transition-all cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                {labels.createLicense}
            </button>

            {open && (
                <Modal onClose={() => setOpen(false)} title={labels.createLicense}>
                    <form
                        ref={formRef}
                        action={async (fd) => {
                            await createLicense(fd);
                            setOpen(false);
                        }}
                        className="space-y-4"
                    >
                        <Field label="Tier">
                            <select name="tier" defaultValue="basic" className="input-field">
                                <option value="basic">BASIC</option>
                                <option value="pro">PRO</option>
                                <option value="ultra">ULTRA</option>
                            </select>
                        </Field>
                        <Field label={labels.maxActivations}>
                            <input type="number" name="maxActivations" defaultValue={1} min={1} max={10} className="input-field" />
                        </Field>
                        <Field label={labels.usageLimit}>
                            <input type="number" name="usageLimit" defaultValue={-1} min={-1} className="input-field" />
                            <p className="text-xs text-text-tertiary mt-1">-1 = {labels.unlimited}</p>
                        </Field>
                        <Field label={labels.expiresInDays}>
                            <input type="number" name="expiresInDays" defaultValue={30} min={1} className="input-field" />
                        </Field>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setOpen(false)} className="btn-cancel">{labels.cancel}</button>
                            <button type="submit" className="btn-primary">{labels.create}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}

/* ─── Edit Modal ─── */
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

    return (
        <>
            <button onClick={() => setOpen(true)} className="action-btn" title={labels.edit}>
                <Pencil className="w-3.5 h-3.5" />
            </button>

            {open && (
                <Modal onClose={() => setOpen(false)} title={labels.editLicense}>
                    <form
                        action={async (fd) => {
                            await updateLicense(fd);
                            setOpen(false);
                        }}
                        className="space-y-4"
                    >
                        <input type="hidden" name="id" value={license.id} />
                        <Field label="Tier">
                            <select name="tier" defaultValue={license.tier} className="input-field">
                                <option value="basic">BASIC</option>
                                <option value="pro">PRO</option>
                                <option value="ultra">ULTRA</option>
                            </select>
                        </Field>
                        <Field label={labels.maxActivations}>
                            <input type="number" name="maxActivations" defaultValue={license.maxActivations} min={1} max={10} className="input-field" />
                        </Field>
                        <Field label={labels.usageLimit}>
                            <input type="number" name="usageLimit" defaultValue={license.usageLimit} min={-1} className="input-field" />
                            <p className="text-xs text-text-tertiary mt-1">-1 = {labels.unlimited}</p>
                        </Field>
                        <Field label={labels.status}>
                            <select name="isActive" defaultValue={license.isActive ? "true" : "false"} className="input-field">
                                <option value="true">{labels.active}</option>
                                <option value="false">{labels.inactive}</option>
                            </select>
                        </Field>
                        <Field label={labels.extendDays}>
                            <input type="number" name="extendDays" defaultValue={0} min={0} className="input-field" />
                            <p className="text-xs text-text-tertiary mt-1">{labels.extendDaysHint}</p>
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

/* ─── Reset HWID Button ─── */
export function ResetHwidButton({ licenseId, labels }: { licenseId: string; labels: Record<string, string> }) {
    const [confirming, setConfirming] = useState(false);

    if (confirming) {
        return (
            <div className="flex items-center gap-1">
                <form action={async (fd) => { await resetHwid(fd); setConfirming(false); }}>
                    <input type="hidden" name="id" value={licenseId} />
                    <button type="submit" className="text-xs px-2 py-1 rounded bg-warning/20 text-warning hover:bg-warning/30 transition-colors cursor-pointer">
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
        <button onClick={() => setConfirming(true)} className="action-btn" title={labels.resetHwid}>
            <RotateCcw className="w-3.5 h-3.5" />
        </button>
    );
}

/* ─── Delete Button ─── */
export function DeleteLicenseButton({ licenseId, labels }: { licenseId: string; labels: Record<string, string> }) {
    const [confirming, setConfirming] = useState(false);

    if (confirming) {
        return (
            <div className="flex items-center gap-1">
                <form action={async (fd) => { await deleteLicense(fd); setConfirming(false); }}>
                    <input type="hidden" name="id" value={licenseId} />
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
        <button onClick={() => setConfirming(true)} className="action-btn text-error" title={labels.delete}>
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    );
}

/* ─── Shared Components ─── */
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
            {children}
        </div>
    );
}
