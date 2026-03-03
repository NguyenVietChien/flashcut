"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE } from "@/lib/constants";

export { PAGE_SIZE };

export function Pagination({
    total,
    pageSize = PAGE_SIZE,
}: {
    total: number;
    pageSize?: number;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (totalPages <= 1) return null;

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(page));
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Generate page numbers to show
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-sm text-text-tertiary">
                {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, total)} / {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`dots-${i}`} className="px-2 text-text-tertiary text-sm">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${p === currentPage
                                ? "bg-accent text-white"
                                : "hover:bg-bg-hover text-text-secondary"
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
