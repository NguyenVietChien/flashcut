"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

const SUPPORT_CHANNELS = [
    {
        name: "Zalo",
        href: "https://zalo.me/0987654321",
        color: "#0068FF",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.18-.096-.36-.186-.54-.27a7.958 7.958 0 00-.576-.234c-.42-.156-.852-.276-1.296-.36a8.382 8.382 0 00-1.656-.156c-4.2 0-7.2 3.12-7.2 6.72 0 1.2.36 2.28.96 3.24.12.18.24.36.384.528l.024.024-.48 1.752 1.848-.48c.84.48 1.8.744 2.832.744h.048c4.2 0 7.56-3.12 7.56-6.72 0-1.68-.72-3.24-1.908-4.44a6.1 6.1 0 00-.996-.768zM9.6 11.04h-.96a.36.36 0 00-.36.36v.24c0 .198.162.36.36.36h.24v1.92a.36.36 0 00.36.36h.24a.36.36 0 00.36-.36V11.4a.36.36 0 00-.24-.36zm4.08 0h-.96a.36.36 0 00-.36.36v2.52a.36.36 0 00.36.36h.96a.36.36 0 00.36-.36v-.24a.36.36 0 00-.36-.36h-.6v-.36h.6a.36.36 0 00.36-.36v-.24a.36.36 0 00-.36-.36h-.6v-.36h.6a.36.36 0 00.36-.36v-.24a.36.36 0 00-.36-.36zm-2.04 0h-.24a.36.36 0 00-.36.36v1.656l-.936-1.836a.36.36 0 00-.324-.18h-.24a.36.36 0 00-.36.36v2.52a.36.36 0 00.36.36h.24a.36.36 0 00.36-.36V12.3l.936 1.836a.36.36 0 00.324.18h.24a.36.36 0 00.36-.36V11.4a.36.36 0 00-.36-.36z" />
            </svg>
        ),
    },
    {
        name: "Telegram",
        href: "https://t.me/flashcutai",
        color: "#26A5E4",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
        ),
    },
    {
        name: "Discord",
        href: "https://discord.gg/flashcutai",
        color: "#5865F2",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
            </svg>
        ),
    },
];

export default function FloatSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Support channels popup */}
            <div
                className={`flex flex-col gap-2 transition-all duration-300 origin-bottom-right ${isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-75 translate-y-4 pointer-events-none"
                    }`}
            >
                {/* Header */}
                <div className="bg-bg-secondary/95 backdrop-blur-xl border border-border-default rounded-2xl p-4 shadow-2xl min-w-[240px]">
                    <p className="text-text-primary font-semibold text-sm mb-1">
                        💬 Hỗ trợ khách hàng
                    </p>
                    <p className="text-text-tertiary text-xs mb-3">
                        Chọn kênh liên hệ bên dưới
                    </p>

                    <div className="flex flex-col gap-2">
                        {SUPPORT_CHANNELS.map((channel) => (
                            <a
                                key={channel.name}
                                href={channel.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    backgroundColor: `${channel.color}15`,
                                    border: `1px solid ${channel.color}30`,
                                }}
                                onClick={() => setIsOpen(false)}
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                                    style={{ backgroundColor: channel.color }}
                                >
                                    {channel.icon}
                                </div>
                                <div>
                                    <span className="text-text-primary text-sm font-medium block">
                                        {channel.name}
                                    </span>
                                    <span className="text-text-tertiary text-[11px]">
                                        Trò chuyện ngay
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Float button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative w-14 h-14 rounded-full shadow-lg shadow-accent/25 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-xl hover:shadow-accent/30"
                style={{
                    background: "linear-gradient(135deg, #00D4AA 0%, #00B894 100%)",
                }}
                aria-label="Support"
            >
                {/* Pulse ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-accent" />
                )}

                {/* Icon */}
                <span className="relative flex items-center justify-center text-white transition-transform duration-300">
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <MessageCircle className="w-6 h-6" />
                    )}
                </span>
            </button>
        </div>
    );
}
