"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useTransition } from "react";
import { Search, X, ArrowUpDown, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type FilterOption = {
    label: string;
    value: string;
};

type FilterConfig = {
    key: string;
    label: string;
    allLabel: string;
    options: FilterOption[];
};

type SortOption = {
    label: string;
    value: string;
};

/* ── FilterBar ─────────────────────────────────────────── */
export function FilterBar({
    filters = [],
    sortOptions = [],
    searchPlaceholder = "Search...",
    showSearch = true,
    totalLabel,
}: {
    filters?: FilterConfig[];
    sortOptions?: SortOption[];
    searchPlaceholder?: string;
    showSearch?: boolean;
    totalLabel?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

    // Update URL params
    const updateParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            // Reset page when filter changes
            params.delete("page");
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
            });
        },
        [router, pathname, searchParams]
    );

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            const current = searchParams.get("q") || "";
            if (searchValue !== current) {
                updateParam("q", searchValue);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchValue, searchParams, updateParam]);

    // Check if any filters are active
    const hasActiveFilters = filters.some((f) => searchParams.get(f.key)) || searchParams.get("q") || searchParams.get("sort");

    const clearAll = () => {
        startTransition(() => {
            router.push(pathname, { scroll: false });
        });
        setSearchValue("");
    };

    return (
        <div className={`flex flex-wrap items-center gap-2.5 mb-6 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
            {/* Search */}
            {showSearch && (
                <div className="relative w-full sm:w-auto sm:min-w-[180px] sm:max-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <Input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-9 pr-8 bg-bg-secondary"
                    />
                    {searchValue && (
                        <button
                            onClick={() => setSearchValue("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-bg-hover text-text-tertiary cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Divider */}
            {showSearch && (filters.length > 0 || sortOptions.length > 0) && (
                <div className="w-px h-6 bg-border-default" />
            )}

            {/* Filter dropdowns — shadcn Select */}
            {filters.map((filter) => {
                const currentVal = searchParams.get(filter.key) || "";
                return (
                    <Select
                        key={filter.key}
                        value={currentVal || "__all__"}
                        onValueChange={(val) => updateParam(filter.key, val === "__all__" ? "" : val)}
                    >
                        <SelectTrigger
                            className={`bg-bg-secondary text-sm h-9 min-w-[120px] ${currentVal
                                ? "border-accent/40 bg-accent/10 text-accent"
                                : "border-border-default text-text-secondary hover:bg-bg-hover"
                                }`}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">{filter.allLabel}</SelectItem>
                            {filter.options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            })}

            {/* Sort dropdown */}
            {sortOptions.length > 0 && (
                <Select
                    value={searchParams.get("sort") || "__default__"}
                    onValueChange={(val) => updateParam("sort", val === "__default__" ? "" : val)}
                >
                    <SelectTrigger className="bg-bg-secondary border-border-default text-text-secondary text-sm h-9 min-w-[120px] hover:bg-bg-hover">
                        <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((opt) => (
                            <SelectItem key={opt.value || "__default__"} value={opt.value || "__default__"}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Clear filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg text-text-tertiary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                    title="Clear all filters"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Total label */}
            {totalLabel && (
                <span className="text-sm text-text-tertiary ml-auto tabular-nums">{totalLabel}</span>
            )}
        </div>
    );
}
