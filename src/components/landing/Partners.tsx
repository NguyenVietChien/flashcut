"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const partners = [
    {
        name: "OpenAI",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
            </svg>
        ),
    },
    {
        name: "Gemini",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 2.4a9.6 9.6 0 0 1 9.6 9.6c0 .168-.006.334-.016.5C19.59 8.334 16.028 5.4 12 5.4S4.41 8.334 2.416 12.5A9.72 9.72 0 0 1 2.4 12 9.6 9.6 0 0 1 12 2.4zm0 19.2a9.6 9.6 0 0 1-9.6-9.6c0-.168.006-.334.016-.5C4.41 15.666 7.972 18.6 12 18.6s7.59-2.934 9.584-7.1c.01.166.016.332.016.5a9.6 9.6 0 0 1-9.6 9.6z" />
            </svg>
        ),
    },
    {
        name: "Claude",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M4.709 15.955l4.709-2.73-2.16-1.247L2.55 14.71zm6.069-3.516l4.709-2.73-2.16-1.247L8.618 11.19zm.15 5.735l4.559-2.643V12.55l-4.56 2.643zM4.86 18.926l4.559-2.643v-2.981L4.86 15.945zm12.188-8.477l4.709-2.73-2.16-1.247-4.71 2.73zm.15 5.735l4.559-2.643V10.56l-4.56 2.643zm-6.069 3.516l4.559-2.643V14.076l-4.56 2.643zM4.86 24.66l4.559-2.643v-2.981L4.86 21.679zm12.338-2.503l4.559-2.643v-2.981l-4.56 2.643zm-6.069 3.516l4.559-2.643V20.05l-4.56 2.643z" />
            </svg>
        ),
    },
    {
        name: "ElevenLabs",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M9.5 3h2v18h-2zM12.5 3h2v18h-2z" />
            </svg>
        ),
    },
    {
        name: "Deepgram",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2v-5h2v5zm0-7h-2V8h2v1z" />
            </svg>
        ),
    },
    {
        name: "Midjourney",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M3 3l4.5 9L3 21h2.1l3.6-7.2L12.3 21h2.1l-4.5-9 4.5-9h-2.1l-3.6 7.2L5.1 3zM14.7 3l4.5 9-4.5 9h2.1l3.6-7.2L24.5 21h2.1l-4.5-9 4.5-9h-2.1l-3.6 7.2L17.3 3z" />
            </svg>
        ),
    },
    {
        name: "Groq",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
            </svg>
        ),
    },
    {
        name: "Flux",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
        ),
    },
];


export default function Partners() {
    const t = useTranslations("partners");

    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 section-divider" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <p className="text-text-secondary text-sm uppercase tracking-widest mb-2">
                        {t("label")}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
                        {t("title")}
                    </h2>
                </motion.div>

                {/* Marquee Container */}
                <div className="relative">
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-bg-primary to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none" />

                    <div className="overflow-hidden py-6">
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 25,
                                    ease: "linear",
                                },
                            }}
                            className="flex gap-12 w-max"
                        >
                            {[...partners, ...partners].map((partner, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.1, y: -4 }}
                                    className="flex flex-col items-center gap-3 px-6 py-4 glass-card rounded-xl min-w-[120px] cursor-pointer group"
                                >
                                    <div className="text-text-tertiary group-hover:text-accent transition-colors duration-300">
                                        {partner.icon}
                                    </div>
                                    <span className="text-text-secondary group-hover:text-text-primary text-sm font-medium transition-colors duration-300 whitespace-nowrap">
                                        {partner.name}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
