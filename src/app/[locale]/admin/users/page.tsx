import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function AdminUsersPage() {
    const t = await getTranslations("admin");

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            licenses: { select: { plan: true, status: true }, take: 1, orderBy: { activatedAt: "desc" } },
            _count: { select: { orders: true } },
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-text-primary">{t("users")}</h1>
                <span className="text-sm text-text-tertiary">{users.length} {t("total")}</span>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-default">
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("name")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">Email</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">Role</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("plan")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("ordersCount")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("createdAt")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-bg-hover transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.image ? (
                                                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                                                    {(user.name || user.email || "?")[0].toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-sm text-text-primary font-medium">{user.name || "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "admin" ? "bg-accent/20 text-accent" : "bg-bg-tertiary text-text-secondary"}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                        {user.licenses[0]?.plan?.toUpperCase() || "Free"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{user._count.orders}</td>
                                    <td className="px-6 py-4 text-sm text-text-tertiary">
                                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
