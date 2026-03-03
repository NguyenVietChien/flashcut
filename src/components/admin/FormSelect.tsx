"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
    label: string;
    value: string;
};

/**
 * Custom select component for forms (uses hidden input for form data).
 * Drop-in replacement for native <select> in admin forms.
 */
export function FormSelect({
    name,
    label,
    options,
    defaultValue,
    value: controlledValue,
    onChange,
    disabled = false,
    className = "",
}: {
    name?: string;
    label?: string;
    options: Option[];
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || options[0]?.value || "");
    const ref = useRef<HTMLDivElement>(null);

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const selected = options.find((o) => o.value === currentValue);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (val: string) => {
        if (controlledValue === undefined) {
            setInternalValue(val);
        }
        onChange?.(val);
        setOpen(false);
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={currentValue} />}

            {/* Custom trigger */}
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all border ${disabled
                        ? "border-border-default bg-bg-tertiary text-text-tertiary cursor-not-allowed opacity-60"
                        : open
                            ? "border-accent/50 bg-bg-secondary text-text-primary ring-1 ring-accent/20"
                            : "border-border-default bg-bg-secondary text-text-primary hover:border-text-tertiary cursor-pointer"
                    }`}
            >
                <span className="truncate">{selected?.label || currentValue}</span>
                <ChevronDown className={`w-4 h-4 text-text-tertiary shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown menu */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 py-1 rounded-xl border border-border-default bg-bg-secondary shadow-xl shadow-black/20 z-50 max-h-[200px] overflow-y-auto">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${opt.value === currentValue
                                    ? "bg-accent/10 text-accent font-medium"
                                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                                } cursor-pointer`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
