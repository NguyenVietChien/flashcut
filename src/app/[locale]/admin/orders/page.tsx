import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { UpdateStatusButton, DeleteOrderButton } from "./components";

export default async function AdminOrdersPage() {
    const t = await getTranslations("admin");

    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
            license: { select: { key: true, status: true } },
        },
    });

    const labels = {
        updateStatus: t("updateStatus"),
        deleteOrder: t("deleteOrder"),
        cancel: t("cancel"),
        save: t("save"),
        confirm: t("confirm"),
        pending: t("pending"),
        paid: t("paid"),
        cancelled: t("cancelled"),
        refunded: t("refunded"),
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-text-primary">{t("orders")}</h1>
                <span className="text-sm text-text-tertiary">{orders.length} {t("total")}</span>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-default">
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("customer")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("plan")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("amount")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("paymentMethod")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">Status</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("licenseKey")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("createdAt")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-bg-hover transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-text-primary font-medium">{order.user.name || "—"}</p>
                                        <p className="text-xs text-text-tertiary">{order.user.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.plan === "ultra" ? "bg-gold/20 text-gold" :
                                            order.plan === "pro" ? "bg-purple-500/20 text-purple-400" :
                                                "bg-bg-tertiary text-text-secondary"
                                            }`}>
                                            {order.plan.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-primary font-medium">
                                        {new Intl.NumberFormat("vi-VN").format(order.amount)}đ
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary capitalize">
                                        {order.paymentMethod}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === "paid" ? "bg-success/20 text-success" :
                                            order.status === "pending" ? "bg-warning/20 text-warning" :
                                                order.status === "refunded" ? "bg-blue-500/20 text-blue-400" :
                                                    "bg-error/20 text-error"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.license ? (
                                            <code className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                                                {order.license.key.substring(0, 16)}...
                                            </code>
                                        ) : (
                                            <span className="text-xs text-text-tertiary">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-tertiary">
                                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <UpdateStatusButton order={{ id: order.id, status: order.status }} labels={labels} />
                                            <DeleteOrderButton orderId={order.id} labels={labels} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-text-tertiary text-sm">
                                        {t("noData")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
