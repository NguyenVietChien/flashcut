"use client";

import { useSession, signOut } from "next-auth/react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { LogOut, LayoutDashboard, User } from "lucide-react";

export default function UserMenu() {
    const { data: session, status } = useSession();
    const t = useTranslations("nav");
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (status === "loading") {
        return <div className="w-8 h-8 rounded-full bg-bg-tertiary animate-pulse" />;
    }

    if (!session?.user) {
        return (
            <Link
                href="/auth/signin"
                className="text-sm font-medium text-text-secondary hover:text-accent transition-colors"
            >
                {t("signIn")}
            </Link>
        );
    }

    const initials = session.user.name
        ? session.user.name.charAt(0).toUpperCase()
        : session.user.email?.charAt(0).toUpperCase() || "U";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 cursor-pointer"
            >
                {session.user.image ? (
                    <img
                        src={session.user.image}
                        alt=""
                        className="w-8 h-8 rounded-full border-2 border-border-default"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold border-2 border-accent/30">
                        {initials}
                    </div>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-56 glass-card rounded-xl border border-border-default shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-border-default mb-1">
                        <p className="text-sm font-medium text-text-primary truncate">
                            {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-text-tertiary truncate">
                            {session.user.email}
                        </p>
                    </div>

                    <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-accent hover:bg-bg-hover rounded-lg transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>

                    <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-accent hover:bg-bg-hover rounded-lg transition-colors"
                    >
                        <User className="w-4 h-4" />
                        {t("profile") ?? "Profile"}
                    </Link>

                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary hover:text-red-400 hover:bg-bg-hover rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        {t("signOut") ?? "Sign Out"}
                    </button>
                </div>
            )}
        </div>
    );
}
