"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
const COOKIE_NAME = "admin_verified";

function signToken(timestamp: number): string {
    const secret = process.env.ADMIN_SECRET || "";
    const data = `${timestamp}`;
    const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
    return `${timestamp}.${hmac}`;
}

function verifyToken(token: string): boolean {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) return false;

    const [timestampStr, signature] = token.split(".");
    if (!timestampStr || !signature) return false;

    const timestamp = parseInt(timestampStr);
    if (isNaN(timestamp)) return false;

    // Check expiration
    if (Date.now() - timestamp > ADMIN_SESSION_DURATION) return false;

    // Verify signature
    const expectedSignature = crypto.createHmac("sha256", secret).update(timestampStr).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function verifyAdminPin(pin: string): Promise<{ success: boolean; error?: string }> {
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
        return { success: false, error: "ADMIN_SECRET not configured" };
    }

    if (pin !== adminSecret) {
        // Small delay to slow brute force
        await new Promise((r) => setTimeout(r, 1000));
        return { success: false, error: "invalid_pin" };
    }

    // Set signed cookie
    const token = signToken(Date.now());
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 60, // 30 minutes
        path: "/",
    });

    return { success: true };
}

export async function isAdminVerified(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifyToken(token);
}

export async function revokeAdminSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}
