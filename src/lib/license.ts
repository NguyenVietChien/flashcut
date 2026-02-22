import { randomBytes } from "crypto";

export function generateLicenseKey(plan: string): string {
    const prefix = plan.toUpperCase().slice(0, 3);
    const random = randomBytes(8).toString("hex").toUpperCase();
    return `FC-${prefix}-${random}`;
}

export function getLicenseExpiry(days = 30): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}
