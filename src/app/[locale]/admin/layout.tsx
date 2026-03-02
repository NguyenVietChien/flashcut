import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { isAdminVerified } from "@/lib/admin-auth";
import AdminPinGate from "@/components/admin/AdminPinGate";
import {
    LayoutDashboard,
    Users,
    Key,
    ShoppingCart,
    FileText,
    Shield,
    LogOut,
} from "lucide-react";
import Link from "next/link";

async function AdminGuard({ locale }: { locale: string }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect(`/${locale}/auth/signin`);
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, name: true, email: true },
    });

    if (!user || user.role !== "admin") {
        redirect(`/${locale}/dashboard`);
    }

    return user;
}

const navItems = [
    { href: "", icon: LayoutDashboard, label: "dashboard" },
    { href: "/users", icon: Users, label: "users" },
    { href: "/desktop-licenses", icon: Key, label: "desktopLicenses" },
    { href: "/orders", icon: ShoppingCart, label: "orders" },
    { href: "/blog", icon: FileText, label: "blog" },
];

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const admin = await AdminGuard({ locale });
    const t = await getTranslations("admin");

    // Layer 3: Check admin PIN verification
    const verified = await isAdminVerified();

    if (!verified) {
        const pinLabels = {
            title: t("pinTitle"),
            subtitle: t("pinSubtitle"),
            placeholder: t("pinPlaceholder"),
            verify: t("pinVerify"),
            verifying: t("pinVerifying"),
            wrongPin: t("pinWrong"),
            configError: t("pinConfigError"),
            tooManyAttempts: t("pinTooMany"),
            sessionInfo: t("pinSessionInfo"),
        };
        return <AdminPinGate labels={pinLabels} />;
    }

    return (
        <div className="min-h-screen flex bg-bg-primary">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border-default bg-bg-secondary flex flex-col">
                <div className="p-6 border-b border-border-default">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-text-primary">FlashCut Admin</h1>
                            <p className="text-xs text-text-tertiary">{admin.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={`/${locale}/admin${item.href}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors group"
                        >
                            <item.icon className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors" />
                            {t(item.label)}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border-default">
                    <Link
                        href={`/${locale}/dashboard`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        {t("backToSite")}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
