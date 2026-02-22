"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton({ label }: { label: string }) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-default text-text-secondary hover:text-red-400 hover:border-red-400/50 transition-colors cursor-pointer text-sm"
        >
            <LogOut className="w-4 h-4" />
            {label}
        </button>
    );
}
