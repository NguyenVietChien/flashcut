"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <section className="min-h-screen flex items-center justify-center px-4 bg-bg-primary">
            <div className="text-center max-w-lg">
                {/* Animated 500 */}
                <div className="relative mb-8">
                    <h1 className="text-[10rem] font-black leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-red-400/40 to-red-400/5 select-none">
                        500
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center backdrop-blur-sm border border-red-500/20">
                            <svg className="w-10 h-10 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-text-primary mb-3">Something Went Wrong</h2>
                <p className="text-text-secondary mb-8 leading-relaxed">
                    An unexpected error occurred. Our team has been notified.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent/20 cursor-pointer"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 rounded-xl border border-border-default text-text-secondary hover:bg-bg-hover font-medium transition-all"
                    >
                        Go Home
                    </a>
                </div>

                {error.digest && (
                    <p className="mt-6 text-xs text-text-tertiary font-mono">Error ID: {error.digest}</p>
                )}
            </div>
        </section>
    );
}
