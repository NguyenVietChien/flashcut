"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";
import { Menu, X, Zap, Moon, Sun, Globe } from "lucide-react";
import { routing } from "@/lib/i18n/routing";
import { useLocale } from "next-intl";
import UserMenu from "@/components/auth/UserMenu";

export default function Navbar() {
    const t = useTranslations("nav");
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const locale = useLocale();

    const navItems = [
        { label: t("features"), href: "/#features" },
        { label: t("pricing"), href: "/#pricing" },
        { label: t("blog"), href: "/blog" },
        { label: t("contact"), href: "/#cta" },
    ];

    const otherLocale = locale === "vi" ? "en" : "vi";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-default">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Zap className="w-6 h-6 text-accent" />
                        <span className="text-xl font-bold text-text-primary">
                            Flash<span className="text-accent">Cut</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-text-secondary hover:text-accent transition-colors text-sm font-medium"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Locale Switcher */}
                        <Link
                            href={pathname}
                            locale={otherLocale}
                            className="flex items-center gap-1.5 text-text-secondary hover:text-accent transition-colors text-sm px-2 py-1 rounded-md hover:bg-bg-hover"
                        >
                            <Globe className="w-4 h-4" />
                            {otherLocale.toUpperCase()}
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-text-secondary hover:text-accent hover:bg-bg-hover transition-all"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="w-4 h-4" />
                            ) : (
                                <Moon className="w-4 h-4" />
                            )}
                        </button>

                        <UserMenu />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-text-secondary"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border-default bg-bg-primary">
                    <div className="px-4 py-4 space-y-3">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="block text-text-secondary hover:text-accent py-2 text-sm"
                            >
                                {item.label}
                            </a>
                        ))}
                        <div className="flex items-center gap-3 pt-3 border-t border-border-default">
                            <Link
                                href={pathname}
                                locale={otherLocale}
                                className="flex items-center gap-1.5 text-text-secondary hover:text-accent text-sm"
                            >
                                <Globe className="w-4 h-4" />
                                {otherLocale.toUpperCase()}
                            </Link>
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-text-secondary hover:text-accent"
                            >
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>
                        <UserMenu />
                    </div>
                </div>
            )}
        </nav>
    );
}
