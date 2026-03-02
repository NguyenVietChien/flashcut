import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Users, Key, ShoppingCart, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
    const t = await getTranslations("admin");

    const [userCount, desktopLicenseCount, orderCount, paidOrderCount] = await Promise.all([
        prisma.user.count(),
        prisma.desktopLicense.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: "paid" } }),
    ]);

    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true } } },
    });

    const cards = [
        { icon: Users, label: t("totalUsers"), value: userCount, color: "text-accent" },
        { icon: Key, label: t("totalLicenses"), value: desktopLicenseCount, color: "text-purple-400" },
        { icon: ShoppingCart, label: t("totalOrders"), value: orderCount, color: "text-amber-400" },
        { icon: TrendingUp, label: t("paidOrders"), value: paidOrderCount, color: "text-emerald-400" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-text-primary mb-8">{t("dashboard")}</h1>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card) => (
                    <div key={card.label} className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                            <span className="text-text-secondary text-sm">{card.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-text-primary">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-text-primary mb-4">{t("recentUsers")}</h2>
                    <div className="space-y-3">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                                <div>
                                    <p className="text-sm text-text-primary font-medium">{user.name || "—"}</p>
                                    <p className="text-xs text-text-tertiary">{user.email}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-accent/20 text-accent" : "bg-bg-tertiary text-text-secondary"}`}>
                                        {user.role}
                                    </span>
                                    <p className="text-xs text-text-tertiary mt-1">
                                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-text-primary mb-4">{t("recentOrders")}</h2>
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                                <div>
                                    <p className="text-sm text-text-primary font-medium">{order.user.email}</p>
                                    <p className="text-xs text-text-tertiary">{order.plan.toUpperCase()} · {order.paymentMethod}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                                        {order.status}
                                    </span>
                                    <p className="text-xs text-text-tertiary mt-1">
                                        {new Intl.NumberFormat("vi-VN").format(order.amount)}đ
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && (
                            <p className="text-sm text-text-tertiary text-center py-4">{t("noData")}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
