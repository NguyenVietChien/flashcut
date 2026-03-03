import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isAdminVerified } from "@/lib/admin-auth";
import AdminPinGate from "@/components/admin/AdminPinGate";
import AdminSidebar from "@/components/admin/AdminSidebar";

async function AdminGuard({ locale }: { locale: string }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect(`/${locale}/auth/signin`);
    }

    // Role is now in JWT — no DB query needed
    if (session.user.role !== "admin") {
        redirect(`/${locale}/dashboard`);
    }

    return { email: session.user.email, name: session.user.name };
}

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

    const sidebarLabels: Record<string, string> = {
        dashboard: t("dashboard"),
        products: t("products"),
        users: t("users"),
        licenses: t("licenses"),
        orders: t("orders"),
        blog: t("blog"),
        backToSite: t("backToSite"),
    };

    return (
        <div className="admin-layout min-h-screen pt-16 flex bg-bg-primary">
            <AdminSidebar locale={locale} email={admin.email} labels={sidebarLabels} />

            {/* Main Content — offset for mobile top bar */}
            <main className="flex-1 overflow-auto pt-12 lg:pt-0">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
