export default function OrdersLoading() {
    return (
        <div className="animate-pulse">
            <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-36 bg-bg-tertiary rounded-lg" />
                <div className="h-4 w-20 bg-bg-tertiary rounded" />
            </div>
            <div className="glass-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border-default">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <th key={i} className="px-6 py-4"><div className="h-3 w-16 bg-bg-tertiary rounded" /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4"><div><div className="h-4 w-28 bg-bg-tertiary rounded mb-1" /><div className="h-3 w-36 bg-bg-tertiary rounded" /></div></td>
                                <td className="px-6 py-4"><div className="h-5 w-12 bg-bg-tertiary rounded-full" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-bg-tertiary rounded" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-14 bg-bg-tertiary rounded" /></td>
                                <td className="px-6 py-4"><div className="h-5 w-14 bg-bg-tertiary rounded-full" /></td>
                                <td className="px-6 py-4"><div className="h-5 w-28 bg-bg-tertiary rounded" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-bg-tertiary rounded" /></td>
                                <td className="px-6 py-4"><div className="flex gap-2"><div className="w-7 h-7 bg-bg-tertiary rounded" /><div className="w-7 h-7 bg-bg-tertiary rounded" /></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
