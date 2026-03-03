"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

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
        <div className={`flex flex-wrap items-center gap-3 mb-6 ${isPending ? "opacity-70" : ""}`}>
            {/* Search */}
            {showSearch && (
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="input-field pl-9 pr-8 py-2 text-sm"
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

            {/* Filter dropdowns */}
            {filters.map((filter) => (
                <select
                    key={filter.key}
                    value={searchParams.get(filter.key) || ""}
                    onChange={(e) => updateParam(filter.key, e.target.value)}
                    className="input-field py-2 text-sm min-w-[120px] cursor-pointer"
                >
                    <option value="">{filter.allLabel}</option>
                    {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ))}

            {/* Sort dropdown */}
            {sortOptions.length > 0 && (
                <select
                    value={searchParams.get("sort") || ""}
                    onChange={(e) => updateParam("sort", e.target.value)}
                    className="input-field py-2 text-sm min-w-[140px] cursor-pointer"
                >
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            )}

            {/* Active filter indicator + clear */}
            {hasActiveFilters && (
                <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Clear
                </button>
            )}

            {/* Total label */}
            {totalLabel && (
                <span className="text-sm text-text-tertiary ml-auto">{totalLabel}</span>
            )}
        </div>
    );
}
