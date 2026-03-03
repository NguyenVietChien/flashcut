/**
 * License Service — Single source of truth for all license operations.
 *
 * Consolidates logic previously scattered across:
 *   - desktop-licenses/actions.ts (admin CRUD)
 *   - api/licenses/issue/route.ts (bot API)
 *   - api/sepay/route.ts (payment webhook)
 *   - lib/license.ts (helpers)
 */

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// ─── Types ───────────────────────────────────────────────────

export interface CreateAdminLicenseInput {
    tier: string;
    productSlug?: string;
    maxActivations?: number;
    usageLimit?: number;
    expiresInDays?: number;
    email?: string;
    contactInfo?: string;
    note?: string;
}

export interface IssueBotLicenseInput {
    productSlug: string;
    planSlug: string;
    source?: string;
    contactInfo?: string;
    buyerEmail?: string;
    note?: string;
}

export interface UpdateLicenseInput {
    tier?: string;
    maxActivations?: number;
    usageLimit?: number;
    status?: string;
    email?: string | null;
    contactInfo?: string | null;
    note?: string | null;
    extendDays?: number;
}

// ─── Key Generation ──────────────────────────────────────────

/**
 * Generate license key in format XXXX-XXXX-XXXX-XXXX (4×4).
 * Matches Flask server format exactly.
 */
export function generateLicenseKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segments: string[] = [];
    for (let i = 0; i < 4; i++) {
        let seg = "";
        for (let j = 0; j < 4; j++) {
            seg += chars[crypto.randomInt(chars.length)];
        }
        segments.push(seg);
    }
    return segments.join("-");
}

/**
 * Calculate license expiry date from now.
 */
export function getLicenseExpiry(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

// ─── Admin License Operations ────────────────────────────────

/**
 * Create license from admin panel.
 */
export async function createAdminLicense(input: CreateAdminLicenseInput) {
    const {
        tier,
        productSlug = "flashcut",
        maxActivations = 1,
        usageLimit = 10,
        expiresInDays = 30,
        email,
        contactInfo,
        note,
    } = input;

    const product = await prisma.product.findUnique({
        where: { slug: productSlug },
    });

    return prisma.license.create({
        data: {
            key: generateLicenseKey(),
            plan: tier,
            tier,
            maxActivations,
            usageLimit: usageLimit === -1 ? null : usageLimit,
            expiresAt: getLicenseExpiry(expiresInDays),
            source: "admin",
            email: email || null,
            contactInfo: contactInfo || null,
            note: note || null,
            productId: product?.id || null,
        },
    });
}

/**
 * Update an existing license.
 */
export async function updateLicense(id: string, input: UpdateLicenseInput) {
    const { tier, maxActivations, usageLimit, status, email, contactInfo, note, extendDays } = input;

    const data: Record<string, unknown> = {};

    if (tier !== undefined) {
        data.tier = tier;
        data.plan = tier;
    }
    if (maxActivations !== undefined) data.maxActivations = maxActivations;
    if (usageLimit !== undefined) data.usageLimit = usageLimit === -1 ? null : usageLimit;
    if (status !== undefined) data.status = status;
    if (email !== undefined) data.email = email;
    if (contactInfo !== undefined) data.contactInfo = contactInfo;
    if (note !== undefined) data.note = note;

    if (extendDays && extendDays > 0) {
        const license = await prisma.license.findUnique({ where: { id } });
        const base = license?.expiresAt && license.expiresAt > new Date()
            ? license.expiresAt
            : new Date();
        const newExpiry = new Date(base);
        newExpiry.setDate(newExpiry.getDate() + extendDays);
        data.expiresAt = newExpiry;
    }

    return prisma.license.update({ where: { id }, data });
}

/**
 * Reset HWID binding for a license.
 */
export async function resetHwid(id: string) {
    return prisma.license.update({
        where: { id },
        data: { hwidHash: null, currentActivations: 0 },
    });
}

/**
 * Delete a license and its activation logs.
 */
export async function deleteLicense(id: string) {
    await prisma.activationLog.deleteMany({ where: { licenseId: id } });
    return prisma.license.delete({ where: { id } });
}

// ─── Bot API License Issuing ─────────────────────────────────

/**
 * Issue license from bot API (Telegram/Zalo).
 * Looks up product + plan, calculates expiry from plan config.
 */
export async function issueBotLicense(input: IssueBotLicenseInput) {
    const { productSlug, planSlug, source = "web", contactInfo, buyerEmail, note } = input;

    const product = await prisma.product.findUnique({
        where: { slug: productSlug },
    });
    if (!product) throw new Error(`Product '${productSlug}' not found`);

    const plan = await prisma.plan.findUnique({
        where: { productId_slug: { productId: product.id, slug: planSlug } },
    });
    if (!plan) throw new Error(`Plan '${planSlug}' not found for product '${productSlug}'`);

    const expiresAt = plan.durationDays
        ? getLicenseExpiry(plan.durationDays)
        : null;

    const license = await prisma.license.create({
        data: {
            key: generateLicenseKey(),
            productId: product.id,
            plan: planSlug,
            tier: planSlug,
            source,
            contactInfo: contactInfo || null,
            email: buyerEmail || null,
            note: note || null,
            maxActivations: plan.maxActivations,
            usageLimit: plan.usageLimit,
            expiresAt,
        },
    });

    return {
        licenseKey: license.key,
        product: product.name,
        plan: plan.name,
        expiresAt: license.expiresAt?.toISOString() || null,
    };
}

// ─── Payment License ─────────────────────────────────────────

/**
 * Create license after successful payment (SePay webhook, Stripe webhook, etc.)
 */
export async function createPaymentLicense(
    orderId: string,
    userId: string | null,
    plan: string,
    durationDays = 30,
) {
    return prisma.license.create({
        data: {
            userId,
            orderId,
            key: generateLicenseKey(),
            plan,
            expiresAt: getLicenseExpiry(durationDays),
        },
    });
}
