import { auth } from "@/lib/auth";

/**
 * Shared admin guard — uses JWT role (zero DB queries).
 * Import in all server actions that require admin access.
 */
export async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    if (session.user.role !== "admin") throw new Error("Forbidden");
    return session.user;
}
