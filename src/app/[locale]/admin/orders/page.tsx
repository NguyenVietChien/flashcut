import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { UpdateStatusButton, DeleteOrderButton } from "./components";
import { FilterBar } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PAGE_SIZE } from "@/lib/constants";
import { Suspense } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { tierBadgeClass, statusBadgeClass } from "@/components/admin/badge-styles";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
    const t = await getTranslations("admin");
    const params = await searchParams;

    // Build Prisma where clause from URL params
    const where: Prisma.OrderWhereInput = {};

    if (params.status) {
        where.status = params.status;
    }
    if (params.plan) {
        where.plan = params.plan;
    }
    if (params.q) {
        const q = params.q;
        where.OR = [
            { buyerEmail: { contains: q, mode: "insensitive" } },
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
        ];
    }

    // Build orderBy from sort param
    let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: "desc" };
    if (params.sort === "oldest") orderBy = { createdAt: "asc" };
    if (params.sort === "amount_high") orderBy = { amount: "desc" };
    if (params.sort === "amount_low") orderBy = { amount: "asc" };

    const page = Math.max(1, parseInt(params.page || "1"));

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy,
            include: {
                user: { select: { name: true, email: true } },
                license: { select: { key: true, status: true } },
            },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.order.count({ where }),
    ]);

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
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-text-primary">{t("orders")}</h1>
            </div>

            <FilterBar
                searchPlaceholder={t("searchEmail")}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        allLabel: t("allStatuses"),
                        options: [
                            { value: "pending", label: t("pending") },
                            { value: "paid", label: t("paid") },
                            { value: "cancelled", label: t("cancelled") },
                            { value: "refunded", label: t("refunded") },
                        ],
                    },
                    {
                        key: "plan",
                        label: "Plan",
                        allLabel: t("allPlans"),
                        options: [
                            { value: "basic", label: "Basic" },
                            { value: "pro", label: "Pro" },
                            { value: "ultra", label: "Ultra" },
                        ],
                    },
                ]}
                sortOptions={[
                    { value: "", label: t("sortNewest") },
                    { value: "oldest", label: t("sortOldest") },
                    { value: "amount_high", label: t("sortAmountHigh") },
                    { value: "amount_low", label: t("sortAmountLow") },
                ]}
                totalLabel={`${total} ${t("total")}`}
            />

            <div className="rounded-xl border border-border-default bg-bg-secondary/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-[900px]">
                        <TableHeader>
                            <TableRow className="border-border-default hover:bg-transparent">
                                <TableHead className="text-text-tertiary">{t("customer")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("plan")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("amount")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("paymentMethod")}</TableHead>
                                <TableHead className="text-text-tertiary">Status</TableHead>
                                <TableHead className="text-text-tertiary">{t("licenseKey")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("createdAt")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="border-border-default hover:bg-bg-hover/50 transition-colors">
                                    <TableCell>
                                        <p className="text-sm text-text-primary font-medium">{order.user?.name || "—"}</p>
                                        <p className="text-xs text-text-tertiary">{order.user?.email || order.buyerEmail || "—"}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={tierBadgeClass(order.plan)}>
                                            {order.plan.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-text-primary font-medium tabular-nums">
                                        {new Intl.NumberFormat("vi-VN").format(order.amount)}đ
                                    </TableCell>
                                    <TableCell className="text-sm text-text-secondary capitalize">
                                        {order.paymentMethod}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusBadgeClass(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {order.license ? (
                                            <code className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                                                {order.license.key.substring(0, 16)}...
                                            </code>
                                        ) : (
                                            <span className="text-xs text-text-tertiary">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-text-tertiary tabular-nums">
                                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <UpdateStatusButton order={{ id: order.id, status: order.status }} labels={labels} />
                                            <DeleteOrderButton orderId={order.id} labels={labels} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-text-tertiary text-sm py-12">
                                        {t("noData")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Pagination total={total} />
        </div>
    );
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <Suspense>
            <OrdersContent searchParams={searchParams} />
        </Suspense>
    );
}
