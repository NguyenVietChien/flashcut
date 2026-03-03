import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { EditRoleButton, DeleteUserButton } from "./components";
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
import { tierBadgeClass } from "@/components/admin/badge-styles";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

async function UsersContent({ searchParams }: { searchParams: SearchParams }) {
    const t = await getTranslations("admin");
    const session = await auth();
    const currentUserId = session?.user?.id;
    const params = await searchParams;

    // Build Prisma where clause
    const where: Prisma.UserWhereInput = {};

    if (params.role) {
        where.role = params.role;
    }
    if (params.q) {
        const q = params.q;
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
        ];
    }

    // Build orderBy
    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };
    if (params.sort === "oldest") orderBy = { createdAt: "asc" };

    const page = Math.max(1, parseInt(params.page || "1"));

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy,
            include: {
                licenses: { select: { plan: true, status: true }, take: 1, orderBy: { activatedAt: "desc" } },
                _count: { select: { orders: true } },
            },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.user.count({ where }),
    ]);

    const labels = {
        editRole: t("editRole"),
        deleteUser: t("deleteUser"),
        cancel: t("cancel"),
        save: t("save"),
        confirm: t("confirm"),
    };



    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-text-primary">{t("users")}</h1>
            </div>

            <FilterBar
                searchPlaceholder={t("searchEmail")}
                filters={[
                    {
                        key: "role",
                        label: "Role",
                        allLabel: t("allRoles"),
                        options: [
                            { value: "user", label: "User" },
                            { value: "admin", label: "Admin" },
                        ],
                    },
                ]}
                sortOptions={[
                    { value: "", label: t("sortNewest") },
                    { value: "oldest", label: t("sortOldest") },
                ]}
                totalLabel={`${total} ${t("total")}`}
            />

            <div className="rounded-xl border border-border-default bg-bg-secondary/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-[700px]">
                        <TableHeader>
                            <TableRow className="border-border-default hover:bg-transparent">
                                <TableHead className="text-text-tertiary">{t("name")}</TableHead>
                                <TableHead className="text-text-tertiary">Email</TableHead>
                                <TableHead className="text-text-tertiary">Role</TableHead>
                                <TableHead className="text-text-tertiary">{t("plan")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("ordersCount")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("createdAt")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="border-border-default hover:bg-bg-hover/50 transition-colors">
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell className="text-sm text-text-secondary">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            user.role === "admin"
                                                ? "bg-accent/15 text-accent border-accent/30"
                                                : "bg-bg-tertiary text-text-secondary border-border-default"
                                        }>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={tierBadgeClass(user.licenses[0]?.plan)}>
                                            {user.licenses[0]?.plan?.toUpperCase() || "FREE"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-text-secondary tabular-nums">{user._count.orders}</TableCell>
                                    <TableCell className="text-sm text-text-tertiary tabular-nums">
                                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <EditRoleButton
                                                user={{ id: user.id, role: user.role, name: user.name, email: user.email }}
                                                labels={labels}
                                            />
                                            <DeleteUserButton
                                                userId={user.id}
                                                isCurrentUser={user.id === currentUserId}
                                                labels={labels}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-text-tertiary text-sm py-12">
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

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <Suspense>
            <UsersContent searchParams={searchParams} />
        </Suspense>
    );
}
