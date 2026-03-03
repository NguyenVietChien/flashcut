import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ONE-TIME setup: promotes the currently logged-in user to admin
// DELETE THIS FILE after use!
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
        where: { role: "admin" },
    });

    if (existingAdmin) {
        return NextResponse.json({
            error: "Admin already exists. Delete this file.",
            adminEmail: existingAdmin.email,
        });
    }

    // Promote current user
    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "admin" },
    });

    return NextResponse.json({
        success: true,
        message: "You are now admin! DELETE src/app/api/admin/setup/route.ts",
        email: user.email,
    });
}
