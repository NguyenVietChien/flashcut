"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
    LayoutDashboard,
    Users,
    Key,
    ShoppingCart,
    FileText,
    Shield,
    LogOut,
    Package,
    Menu,
    X,
    Music,
} from "lucide-react";

const navItems = [
    { href: "", icon: LayoutDashboard, label: "dashboard" },
    { href: "/products", icon: Package, label: "products" },
    { href: "/users", icon: Users, label: "users" },
    { href: "/desktop-licenses", icon: Key, label: "licenses" },
    { href: "/orders", icon: ShoppingCart, label: "orders" },
    { href: "/blog", icon: FileText, label: "blog" },
    { href: "/sfx", icon: Music, label: "sfx" },
];

export default function AdminSidebar({
    locale,
    email,
    labels,
}: {
    locale: string;
    email: string | null | undefined;
    labels: Record<string, string>;
}) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Close drawer on Escape key
    useEffect(() => {
        if (!mobileOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [mobileOpen]);

    // Prevent body scroll when drawer open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const isActive = useCallback(
        (href: string) => {
            const fullHref = `/${locale}/admin${href}`;
            if (href === "") {
                // Dashboard: exact match only
                return pathname === fullHref || pathname === fullHref + "/";
            }
            return pathname.startsWith(fullHref);
        },
        [pathname, locale]
    );

    const sidebarContent = (
        <>
            {/* Header */}
            <div className="p-6 border-b border-border-default">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-bold text-text-primary">FlashCut Admin</h1>
                        <p className="text-sm text-text-tertiary truncate">{email}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.label}
                            href={`/${locale}/admin${item.href}`}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${active
                                ? "bg-accent/15 text-accent font-medium"
                                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                                }`}
                        >
                            <item.icon
                                className={`w-5 h-5 transition-colors ${active
                                    ? "text-accent"
                                    : "text-text-tertiary group-hover:text-accent"
                                    }`}
                            />
                            {labels[item.label] || item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border-default">
                <Link
                    href={`/${locale}/dashboard`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    {labels.backToSite || "Back to Site"}
                </Link>
            </div>
        </>
    );

    return (
        <>
            {/* ─── Mobile top bar ─── */}
            <div className="lg:hidden fixed top-16 left-0 right-0 z-40 h-12 bg-bg-secondary border-b border-border-default flex items-center px-4 gap-3">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-text-primary">Admin</span>
                </div>
            </div>

            {/* ─── Desktop sidebar ─── */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-border-default bg-bg-secondary sticky top-16 h-[calc(100vh-4rem)]">
                {sidebarContent}
            </aside>

            {/* ─── Mobile drawer overlay ─── */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 animate-in fade-in-0 duration-200"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Drawer */}
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-bg-secondary border-r border-border-default flex flex-col animate-in slide-in-from-left duration-200 shadow-2xl">
                        {/* Close button */}
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-1.5 rounded-lg text-text-tertiary hover:bg-bg-hover transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}
