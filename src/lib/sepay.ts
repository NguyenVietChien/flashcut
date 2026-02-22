import { PLANS, PlanId } from "./stripe";

export const SEPAY_CONFIG = {
    bankName: "MB Bank",
    bankBin: "970422",
    accountNumber: "0987654321",
    accountHolder: "NGUYEN VIET CHIEN",
    qrTemplate: "https://img.vietqr.io/image",
};

export function generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FC${timestamp}${random}`;
}

export function buildSepayQrUrl(amount: number, orderCode: string): string {
    return `${SEPAY_CONFIG.qrTemplate}/${SEPAY_CONFIG.bankBin}-${SEPAY_CONFIG.accountNumber}-compact.png?amount=${amount}&addInfo=${orderCode}&accountName=${encodeURIComponent(SEPAY_CONFIG.accountHolder)}`;
}

export function parseSepayOrderCode(content: string): string | null {
    const match = content.match(/FC[A-Z0-9]+/);
    return match ? match[0] : null;
}

export function getPlanAmount(plan: PlanId): number {
    return PLANS[plan].price;
}
