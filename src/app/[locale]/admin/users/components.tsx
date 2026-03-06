"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "./actions";
import { Pencil } from "lucide-react";
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
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

/* ─── Edit Role Button ─── */
export function EditRoleButton({
    user,
    labels,
}: {
    user: { id: string; role: string; name: string | null; email: string | null };
    labels: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState(user.role);

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setRole(user.role); }}>
            <DialogTrigger asChild>
                <button className="action-btn" title={labels.editRole}>
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{labels.editRole}</DialogTitle>
                </DialogHeader>
                <form
                    action={async (fd) => {
                        await updateUserRole(fd);
                        setOpen(false);
                    }}
                    className="space-y-4"
                >
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="role" value={role} />
                    <div className="mb-3">
                        <p className="text-sm text-text-primary font-medium">{user.name || "—"}</p>
                        <p className="text-xs text-text-tertiary">{user.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
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
    if (isCurrentUser) return null;

    return (
        <ConfirmDeleteDialog
            title={labels.deleteUser}
            description="Permanently delete this user and all their data? This cannot be undone."
            action={deleteUser}
            hiddenFields={{ id: userId }}
            labels={{ cancel: labels.cancel, confirm: labels.confirm }}
        />
    );
}

