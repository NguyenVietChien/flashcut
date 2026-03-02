export default function AdminLoading() {
    return (
        <div className="animate-pulse">
            <div className="h-8 w-48 bg-bg-tertiary rounded-lg mb-8" />

            {/* Stat cards skeleton */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-bg-tertiary" />
                            <div className="h-4 w-24 bg-bg-tertiary rounded" />
                        </div>
                        <div className="h-8 w-16 bg-bg-tertiary rounded" />
                    </div>
                ))}
            </div>

            {/* Charts skeleton */}
            <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="glass-card p-6">
                        <div className="h-5 w-40 bg-bg-tertiary rounded mb-6" />
                        <div className="flex items-end gap-2 h-40">
                            {Array.from({ length: 7 }).map((_, j) => (
                                <div key={j} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full rounded-t-md bg-bg-tertiary" style={{ height: `${30 + Math.random() * 70}px` }} />
                                    <div className="h-3 w-8 bg-bg-tertiary rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent lists skeleton */}
            <div className="grid lg:grid-cols-2 gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="glass-card p-6">
                        <div className="h-5 w-32 bg-bg-tertiary rounded mb-4" />
                        {Array.from({ length: 5 }).map((_, j) => (
                            <div key={j} className="flex items-center justify-between py-3 border-b border-border-default last:border-0">
                                <div>
                                    <div className="h-4 w-32 bg-bg-tertiary rounded mb-1" />
                                    <div className="h-3 w-48 bg-bg-tertiary rounded" />
                                </div>
                                <div className="h-5 w-16 bg-bg-tertiary rounded-full" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
