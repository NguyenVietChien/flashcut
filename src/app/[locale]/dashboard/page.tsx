import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/auth/SignOutButton";
import { Zap, FolderOpen, Settings, TrendingUp, Key, Clock, ShieldCheck, Package, CreditCard } from "lucide-react";

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect(`/${locale}/auth/signin`);
    }

    const t = await getTranslations("dashboard");

    const [license, orderCount, orders] = await Promise.all([
        prisma.license.findFirst({
            where: { userId: session.user.id, status: "active" },
            orderBy: { activatedAt: "desc" },
        }),
        prisma.order.count({
            where: { userId: session.user.id, status: "paid" },
        }),
        prisma.order.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { license: { select: { key: true } } },
        }),
    ]);

    const currentPlan = license ? license.plan.charAt(0).toUpperCase() + license.plan.slice(1) : "Free";
    const isExpired = license ? new Date(license.expiresAt) < new Date() : false;

    const cards = [
        { icon: Zap, label: t("projects"), value: "0", color: "text-accent", bg: "bg-accent/10" },
        { icon: FolderOpen, label: t("videos"), value: "0", color: "text-purple-400", bg: "bg-purple-400/10" },
        { icon: TrendingUp, label: t("views"), value: String(orderCount), color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { icon: Settings, label: t("plan"), value: currentPlan, color: "text-amber-400", bg: "bg-amber-400/10" },
    ];

    return (
        <section className="py-24 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-1">
                            {t("welcome")}, {session.user.name || session.user.email}!
                        </h1>
                        <p className="text-text-secondary">{t("subtitle")}</p>
                    </div>
                    <SignOutButton label={t("signOut")} />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {cards.map((card) => (
                        <div key={card.label} className="glass-card p-6 hover:border-accent/30 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <span className="text-text-secondary text-sm">{card.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                        </div>
                    ))}
                </div>

                {license && (
                    <div className={`glass-card p-6 mb-8 border ${isExpired ? "border-red-500/50" : "border-accent/30"}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className={`w-5 h-5 ${isExpired ? "text-red-400" : "text-success"}`} />
                            <h2 className="text-lg font-bold text-text-primary">{t("licenseTitle")}</h2>
                            <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${isExpired ? "bg-red-500/20 text-red-400" : "bg-success/20 text-success"}`}>
                                {isExpired ? t("expired") : t("active")}
                            </span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-text-tertiary" />
                                <div>
                                    <p className="text-text-tertiary text-xs">{t("licenseKey")}</p>
                                    <p className="text-text-primary font-mono text-sm">{license.key}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 text-text-tertiary" />
                                <div>
                                    <p className="text-text-tertiary text-xs">{t("plan")}</p>
                                    <p className="text-text-primary font-medium">{currentPlan}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-text-tertiary" />
                                <div>
                                    <p className="text-text-tertiary text-xs">{t("expiresAt")}</p>
                                    <p className="text-text-primary font-medium">
                                        {new Date(license.expiresAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order History */}
                {orders.length > 0 && (
                    <div className="glass-card p-6 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-5 h-5 text-accent" />
                            <h2 className="text-lg font-bold text-text-primary">{t("orderHistory")}</h2>
                        </div>
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between py-3 border-b border-border-default last:border-0">
                                    <div className="flex items-center gap-3">
                                        <Package className="w-4 h-4 text-text-tertiary" />
                                        <div>
                                            <p className="text-sm text-text-primary font-medium">
                                                {order.plan.toUpperCase()} Plan
                                            </p>
                                            <p className="text-xs text-text-tertiary">
                                                {new Date(order.createdAt).toLocaleDateString("vi-VN")} · {order.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-text-primary font-medium">
                                            {new Intl.NumberFormat("vi-VN").format(order.amount)}đ
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === "paid" ? "bg-success/20 text-success" :
                                            order.status === "pending" ? "bg-warning/20 text-warning" :
                                                "bg-error/20 text-error"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="glass-card p-8 text-center">
                    <h2 className="text-xl font-bold text-text-primary mb-2">
                        {t("getStarted")}
                    </h2>
                    <p className="text-text-secondary mb-6 max-w-md mx-auto">
                        {t("getStartedDesc")}
                    </p>
                    <button className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:brightness-110 transition-all cursor-pointer">
                        {t("createProject")}
                    </button>
                </div>
            </div>
        </section>
    );
}
