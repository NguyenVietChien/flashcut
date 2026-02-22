"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Sparkles } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

const ANNOUNCEMENT_ID = "flashcut-ann-v1";

export function useAnnouncementVisible() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const dismissed = localStorage.getItem(ANNOUNCEMENT_ID);
        if (!dismissed) setVisible(true);
    }, []);
    return visible;
}

export default function AnnouncementBar() {
    const t = useTranslations("announcement");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(ANNOUNCEMENT_ID);
        if (!dismissed) setVisible(true);
    }, []);

    const dismiss = () => {
        setVisible(false);
        localStorage.setItem(ANNOUNCEMENT_ID, "1");
        window.dispatchEvent(new Event("announcement-dismissed"));
    };

    if (!visible) return null;

    return (
        <div className="announcement-bar">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-white/90 font-medium truncate">
                    {t("text")}
                </span>
                <Link
                    href={t("link")}
                    className="shrink-0 text-amber-300 hover:text-amber-200 font-semibold transition-colors underline underline-offset-2"
                >
                    {t("cta")}
                </Link>
                <button
                    onClick={dismiss}
                    className="ml-2 p-0.5 text-white/60 hover:text-white transition-colors shrink-0"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
