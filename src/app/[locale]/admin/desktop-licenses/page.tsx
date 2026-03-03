import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { CreateLicenseButton, EditLicenseButton, ResetHwidButton, DeleteLicenseButton } from "./components";
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
import { tierBadgeClass, sourceBadgeClass } from "@/components/admin/badge-styles";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

async function LicensesContent({ searchParams }: { searchParams: SearchParams }) {
    const t = await getTranslations("admin");
    const params = await searchParams;

    // Build Prisma where clause
    const where: Prisma.LicenseWhereInput = {};

    if (params.status) {
        if (params.status === "expired") {
            where.status = "active";
            where.expiresAt = { lt: new Date() };
        } else if (params.status === "active") {
            where.status = "active";
            where.OR = [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } },
            ];
        } else {
            where.status = params.status;
        }
    }
    if (params.plan) {
        where.plan = params.plan;
    }
    if (params.tier) {
        where.tier = params.tier;
    }
    if (params.q) {
        const q = params.q;
        const searchOr = [
            { key: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { contactInfo: { contains: q, mode: "insensitive" as const } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
        ];
        if (where.OR) {
            where.AND = [{ OR: where.OR }, { OR: searchOr }];
            delete where.OR;
        } else {
            where.OR = searchOr;
        }
    }

    // Build orderBy
    let orderBy: Prisma.LicenseOrderByWithRelationInput = { createdAt: "desc" };
    if (params.sort === "oldest") orderBy = { createdAt: "asc" };
    if (params.sort === "expiring") orderBy = { expiresAt: "asc" };

    const page = Math.max(1, parseInt(params.page || "1"));

    const [licenses, total] = await Promise.all([
        prisma.license.findMany({
            where,
            orderBy,
            include: {
                product: true,
                user: { select: { name: true, email: true } },
                _count: { select: { activationLogs: true } },
            },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.license.count({ where }),
    ]);

    const labels = {
        createLicense: t("createLicense"),
        editLicense: t("editLicense"),
        maxActivations: t("maxActivations"),
        usageLimit: t("usageLimitLabel"),
        unlimited: t("unlimited"),
        expiresInDays: t("expiresInDays"),
        extendDays: t("extendDays"),
        extendDaysHint: t("extendDaysHint"),
        status: "Status",
        active: t("active"),
        inactive: t("inactive"),
        cancel: t("cancel"),
        confirm: t("confirm"),
        create: t("create"),
        save: t("save"),
        edit: t("edit"),
        delete: t("deleteAction"),
        resetHwid: t("resetHwid"),
    };



    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-text-primary">Licenses</h1>
                <CreateLicenseButton labels={labels} />
            </div>

            <FilterBar
                searchPlaceholder={t("searchLicense")}
                filters={[
                    {
                        key: "status",
                        label: "Status",
                        allLabel: t("allStatuses"),
                        options: [
                            { value: "active", label: t("active") },
                            { value: "expired", label: t("expired") },
                            { value: "revoked", label: t("inactive") },
                        ],
                    },
                    {
                        key: "tier",
                        label: "Tier",
                        allLabel: t("allTiers"),
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
                    { value: "expiring", label: t("sortExpiring") },
                ]}
                totalLabel={`${total} ${t("total")}`}
            />

            <div className="rounded-xl border border-border-default bg-bg-secondary/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-[1000px]">
                        <TableHeader>
                            <TableRow className="border-border-default hover:bg-transparent">
                                <TableHead className="text-text-tertiary">{t("licenseKey")}</TableHead>
                                <TableHead className="text-text-tertiary">Product</TableHead>
                                <TableHead className="text-text-tertiary">Tier</TableHead>
                                <TableHead className="text-text-tertiary">Owner</TableHead>
                                <TableHead className="text-text-tertiary">Source</TableHead>
                                <TableHead className="text-text-tertiary">{t("activations")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("usage")}</TableHead>
                                <TableHead className="text-text-tertiary">Status</TableHead>
                                <TableHead className="text-text-tertiary">{t("expiresAt")}</TableHead>
                                <TableHead className="text-text-tertiary">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {licenses.map((lic) => {
                                const isExpired = lic.expiresAt ? new Date(lic.expiresAt) < new Date() : false;
                                const ownerDisplay = lic.user?.name || lic.user?.email || lic.email || lic.contactInfo || "—";
                                return (
                                    <TableRow key={lic.id} className="border-border-default hover:bg-bg-hover/50 transition-colors">
                                        <TableCell>
                                            <code className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                                                {lic.key}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-sm text-text-secondary">
                                            {lic.product?.name || "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={tierBadgeClass(lic.tier)}>
                                                {lic.tier.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-text-secondary" title={lic.note || ""}>
                                            {ownerDisplay}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={sourceBadgeClass(lic.source)}>
                                                {lic.source}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-text-secondary tabular-nums">
                                            {lic.currentActivations}/{lic.maxActivations}
                                        </TableCell>
                                        <TableCell className="text-sm text-text-secondary tabular-nums">
                                            {lic.usageLimit == null ? `${lic.currentUsage}/∞` : `${lic.currentUsage}/${lic.usageLimit}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                lic.status !== "active" || isExpired
                                                    ? "bg-error/15 text-error border-error/30"
                                                    : "bg-success/15 text-success border-success/30"
                                            }>
                                                {lic.status !== "active" ? t("inactive") : isExpired ? t("expired") : t("active")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-text-tertiary tabular-nums">
                                            {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString("vi-VN") : "∞"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <EditLicenseButton
                                                    license={{
                                                        id: lic.id,
                                                        tier: lic.tier,
                                                        maxActivations: lic.maxActivations,
                                                        usageLimit: lic.usageLimit ?? -1,
                                                        isActive: lic.status === "active",
                                                    }}
                                                    labels={labels}
                                                />
                                                <ResetHwidButton licenseId={lic.id} labels={labels} />
                                                <DeleteLicenseButton licenseId={lic.id} labels={labels} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {licenses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center text-text-tertiary text-sm py-12">
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

export default async function AdminLicensesPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <Suspense>
            <LicensesContent searchParams={searchParams} />
        </Suspense>
    );
}
