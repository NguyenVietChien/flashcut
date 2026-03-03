/**
 * Shared badge styling utilities for admin tables.
 * Single source of truth for tier/status/source badge colors.
 */

/** Badge class for plan/tier (basic, pro, ultra) */
export function tierBadgeClass(tier?: string | null): string {
    switch (tier) {
        case "ultra":
            return "bg-gold/15 text-gold border-gold/30";
        case "pro":
            return "bg-purple-500/15 text-purple-400 border-purple-500/30";
        default:
            return "bg-bg-tertiary text-text-secondary border-border-default";
    }
}

/** Badge class for order/license status */
export function statusBadgeClass(status: string): string {
    switch (status) {
        case "paid":
        case "active":
            return "bg-success/15 text-success border-success/30";
        case "pending":
            return "bg-warning/15 text-warning border-warning/30";
        case "cancelled":
        case "revoked":
        case "expired":
            return "bg-error/15 text-error border-error/30";
        default:
            return "bg-bg-tertiary text-text-secondary border-border-default";
    }
}

/** Badge class for license source */
export function sourceBadgeClass(source: string): string {
    switch (source) {
        case "web":
            return "bg-blue-500/15 text-blue-400 border-blue-500/30";
        case "telegram":
            return "bg-sky-500/15 text-sky-400 border-sky-500/30";
        case "zalo":
            return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
        case "admin":
            return "bg-amber-500/15 text-amber-400 border-amber-500/30";
        default:
            return "bg-bg-tertiary text-text-secondary border-border-default";
    }
}
