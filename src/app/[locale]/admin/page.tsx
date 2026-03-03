import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Users, Key, ShoppingCart, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
    const t = await getTranslations("admin");

    const [userCount, licenseCount, orderCount, paidOrderCount] = await Promise.all([
        prisma.user.count(),
        prisma.license.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: "paid" } }),
    ]);

    // Revenue data — last 7 days
    const now = new Date();
    const last7Days: { label: string; revenue: number; users: number }[] = [];

    for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(now.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const [dayRevenue, dayUsers] = await Promise.all([
            prisma.order.aggregate({
                _sum: { amount: true },
                where: { status: "paid", paidAt: { gte: dayStart, lte: dayEnd } },
            }),
            prisma.user.count({
                where: { createdAt: { gte: dayStart, lte: dayEnd } },
            }),
        ]);

        last7Days.push({
            label: dayStart.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" }),
            revenue: dayRevenue._sum.amount || 0,
            users: dayUsers,
        });
    }

    const maxRevenue = Math.max(...last7Days.map((d) => d.revenue), 1);
    const maxUsers = Math.max(...last7Days.map((d) => d.users), 1);
    const totalRevenue = last7Days.reduce((sum, d) => sum + d.revenue, 0);
    const totalNewUsers = last7Days.reduce((sum, d) => sum + d.users, 0);

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
        { icon: Users, label: t("totalUsers"), value: userCount, color: "text-accent", bg: "bg-accent/10" },
        { icon: Key, label: t("totalLicenses"), value: licenseCount, color: "text-purple-400", bg: "bg-purple-400/10" },
        { icon: ShoppingCart, label: t("totalOrders"), value: orderCount, color: "text-amber-400", bg: "bg-amber-400/10" },
        { icon: TrendingUp, label: t("paidOrders"), value: paidOrderCount, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-text-primary mb-8">{t("dashboard")}</h1>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card) => (
                    <div key={card.label} className="glass-card p-6 group hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <span className="text-text-secondary text-sm">{card.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-text-primary">{card.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Revenue Chart */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-text-primary">{t("revenueChart")}</h2>
                        <span className="text-sm font-medium text-emerald-400">
                            {new Intl.NumberFormat("vi-VN").format(totalRevenue)}đ
                        </span>
                    </div>
                    <div className="flex items-end gap-2 h-40">
                        {last7Days.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full relative group">
                                    {day.revenue > 0 && (
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {new Intl.NumberFormat("vi-VN").format(day.revenue)}đ
                                        </div>
                                    )}
                                    <div
                                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-500/60 to-emerald-400/80 transition-all hover:from-emerald-500/80 hover:to-emerald-400"
                                        style={{
                                            height: `${Math.max((day.revenue / maxRevenue) * 120, day.revenue > 0 ? 8 : 2)}px`,
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-text-tertiary">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-text-primary">{t("userGrowth")}</h2>
                        <span className="text-sm font-medium text-accent">
                            +{totalNewUsers} {t("thisWeek")}
                        </span>
                    </div>
                    <div className="flex items-end gap-2 h-40">
                        {last7Days.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full relative group">
                                    {day.users > 0 && (
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                                            +{day.users}
                                        </div>
                                    )}
                                    <div
                                        className="w-full rounded-t-md bg-gradient-to-t from-accent/60 to-accent/80 transition-all hover:from-accent/80 hover:to-accent"
                                        style={{
                                            height: `${Math.max((day.users / maxUsers) * 120, day.users > 0 ? 8 : 2)}px`,
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-text-tertiary">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
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
                                    <p className="text-sm text-text-primary font-medium">{order.user?.email || order.buyerEmail || "—"}</p>
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
