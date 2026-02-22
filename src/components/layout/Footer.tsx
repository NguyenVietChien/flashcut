"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Zap } from "lucide-react";

export default function Footer() {
    const t = useTranslations("footer");

    const linkSections = [
        {
            title: t("product.title"),
            items: [
                { label: t("product.features"), href: "/#features" },
                { label: t("product.pricing"), href: "/#pricing" },
                { label: t("product.download"), href: "/download" },
            ],
        },
        {
            title: t("support.title"),
            items: [
                { label: t("support.contact"), href: "/contact" },
                { label: "Discord", href: "#" },
                { label: "Telegram", href: "#" },
            ],
        },
        {
            title: t("resources.title"),
            items: [
                { label: "Blog", href: "/blog" },
                { label: "Templates", href: "#" },
            ],
        },
        {
            title: t("legal.title"),
            items: [
                { label: t("legal.terms"), href: "/terms" },
                { label: t("legal.privacy"), href: "/privacy" },
            ],
        },
    ];

    return (
        <footer className="border-t border-border-default bg-bg-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-accent" />
                            <span className="text-lg font-bold text-text-primary">
                                Flash<span className="text-accent">Cut</span>
                            </span>
                        </div>
                        <p className="text-text-tertiary text-sm leading-relaxed">
                            {t("description")}
                        </p>
                    </div>

                    {/* Link Columns */}
                    {linkSections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-text-primary font-semibold text-sm mb-4">
                                {section.title}
                            </h4>
                            <ul className="space-y-2">
                                {section.items.map((item) => (
                                    <li key={item.label}>
                                        {item.href.startsWith("#") || item.href.startsWith("/#") ? (
                                            <a
                                                href={item.href}
                                                className="text-text-tertiary hover:text-accent transition-colors text-sm"
                                            >
                                                {item.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="text-text-tertiary hover:text-accent transition-colors text-sm"
                                            >
                                                {item.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border-default flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-text-tertiary text-sm">{t("copyright")}</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-text-tertiary hover:text-accent transition-colors" aria-label="Twitter">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="#" className="text-text-tertiary hover:text-accent transition-colors" aria-label="Discord">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" /></svg>
                        </a>
                        <a href="#" className="text-text-tertiary hover:text-accent transition-colors" aria-label="Telegram">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
