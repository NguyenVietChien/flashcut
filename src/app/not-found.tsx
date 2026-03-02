import Link from "next/link";

export default function NotFound() {
    return (
        <section className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                {/* Animated 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[10rem] font-black leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-accent/40 to-accent/5 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center backdrop-blur-sm border border-accent/20 animate-pulse">
                            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-text-primary mb-3">Page Not Found</h2>
                <p className="text-text-secondary mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent/20"
                    >
                        Go Home
                    </Link>
                    <a
                        href="javascript:history.back()"
                        className="px-6 py-3 rounded-xl border border-border-default text-text-secondary hover:bg-bg-hover font-medium transition-all"
                    >
                        Go Back
                    </a>
                </div>
            </div>
        </section>
    );
}
