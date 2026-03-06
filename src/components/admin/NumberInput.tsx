"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Numeric input with stacked ▲/▼ stepper buttons on the right.
 * Drop-in replacement for <Input type="number" />.
 */
export function NumberInput({
    name,
    defaultValue,
    value,
    onChange,
    min,
    max,
    step = 1,
    className,
    ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
    onChange?: (value: number) => void;
}) {
    const handleStep = (delta: number) => {
        const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
        if (!input) return;
        const current = parseFloat(input.value) || 0;
        const next = current + delta;
        const minVal = min != null ? Number(min) : -Infinity;
        const maxVal = max != null ? Number(max) : Infinity;
        const clamped = Math.min(maxVal, Math.max(minVal, next));
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, "value"
        )?.set;
        nativeInputValueSetter?.call(input, String(clamped));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        onChange?.(clamped);
    };

    return (
        <div className={cn("flex items-stretch rounded-md border border-border-default bg-bg-tertiary overflow-hidden focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-all", className)}>
            <input
                type="number"
                name={name}
                defaultValue={defaultValue}
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
                className="flex-1 min-w-0 h-9 px-3 text-sm text-text-primary bg-transparent outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...props}
            />
            <div className="flex flex-col border-l border-border-default shrink-0">
                <button
                    type="button"
                    onClick={() => handleStep(Number(step) || 1)}
                    className="flex items-center justify-center w-7 flex-1 text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                >
                    <ChevronUp className="w-3 h-3" />
                </button>
                <div className="h-px bg-border-default" />
                <button
                    type="button"
                    onClick={() => handleStep(-(Number(step) || 1))}
                    className="flex items-center justify-center w-7 flex-1 text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                >
                    <ChevronDown className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
