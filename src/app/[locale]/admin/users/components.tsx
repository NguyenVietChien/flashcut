"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "./actions";
import { Pencil, Trash2, X } from "lucide-react";

/* ─── Edit Role Button ─── */
export function EditRoleButton({
    user,
    labels,
}: {
    user: { id: string; role: string; name: string | null; email: string | null };
    labels: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)} className="action-btn" title={labels.editRole}>
                <Pencil className="w-3.5 h-3.5" />
            </button>

            {open && (
                <Modal onClose={() => setOpen(false)} title={labels.editRole}>
                    <form
                        action={async (fd) => {
                            await updateUserRole(fd);
                            setOpen(false);
                        }}
                        className="space-y-4"
                    >
                        <input type="hidden" name="id" value={user.id} />
                        <div className="mb-3">
                            <p className="text-sm text-text-primary font-medium">{user.name || "—"}</p>
                            <p className="text-xs text-text-tertiary">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
                            <select name="role" defaultValue={user.role} className="input-field">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
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

/* ─── Delete User Button ─── */
export function DeleteUserButton({
    userId,
    isCurrentUser,
    labels,
}: {
    userId: string;
    isCurrentUser: boolean;
    labels: Record<string, string>;
}) {
    const [confirming, setConfirming] = useState(false);

    if (isCurrentUser) return null;

    if (confirming) {
        return (
            <div className="flex items-center gap-1">
                <form action={async (fd) => { await deleteUser(fd); setConfirming(false); }}>
                    <input type="hidden" name="id" value={userId} />
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
        <button onClick={() => setConfirming(true)} className="action-btn text-error" title={labels.deleteUser}>
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
