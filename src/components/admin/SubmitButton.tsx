"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Drop-in replacement for <Button type="submit"> inside <form action={...}>.
 * Automatically shows a spinner and disables while the form is submitting.
 */
export function SubmitButton({
    children,
    className,
    variant,
    size,
    icon,
    ...props
}: React.ComponentProps<typeof Button> & {
    icon?: React.ReactNode;
}) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className={cn(className)}
            variant={variant}
            size={size}
            {...props}
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
            {children}
        </Button>
    );
}
