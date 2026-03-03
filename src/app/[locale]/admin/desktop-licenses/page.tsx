import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { CreateLicenseButton, EditLicenseButton, ResetHwidButton, DeleteLicenseButton } from "./components";
import { FilterBar } from "@/components/admin/FilterBar";
import { Pagination, PAGE_SIZE } from "@/components/admin/Pagination";
import { Suspense } from "react";

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
        // Reset OR if status=active already set it
        const searchOr = [
            { key: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { contactInfo: { contains: q, mode: "insensitive" as const } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
        ];
        if (where.OR) {
            // Combine with existing OR (from status=active)
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

    const sourceColors: Record<string, string> = {
        web: "bg-blue-500/20 text-blue-400",
        telegram: "bg-sky-500/20 text-sky-400",
        zalo: "bg-indigo-500/20 text-indigo-400",
        admin: "bg-amber-500/20 text-amber-400",
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Licenses</h1>
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

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-default">
                                <th className="th-cell">{t("licenseKey")}</th>
                                <th className="th-cell">Product</th>
                                <th className="th-cell">Tier</th>
                                <th className="th-cell">Owner</th>
                                <th className="th-cell">Source</th>
                                <th className="th-cell">{t("activations")}</th>
                                <th className="th-cell">{t("usage")}</th>
                                <th className="th-cell">Status</th>
                                <th className="th-cell">{t("expiresAt")}</th>
                                <th className="th-cell">{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                            {licenses.map((lic) => {
                                const isExpired = lic.expiresAt ? new Date(lic.expiresAt) < new Date() : false;
                                const ownerDisplay = lic.user?.name || lic.user?.email || lic.email || lic.contactInfo || "—";
                                return (
                                    <tr key={lic.id} className="hover:bg-bg-hover transition-colors">
                                        <td className="px-6 py-4">
                                            <code className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                                                {lic.key}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {lic.product?.name || "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lic.tier === "ultra" ? "bg-gold/20 text-gold" :
                                                lic.tier === "pro" ? "bg-purple-500/20 text-purple-400" :
                                                    "bg-bg-tertiary text-text-secondary"
                                                }`}>
                                                {lic.tier.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary" title={lic.note || ""}>
                                            {ownerDisplay}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceColors[lic.source] || "bg-bg-tertiary text-text-secondary"}`}>
                                                {lic.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {lic.currentActivations}/{lic.maxActivations}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {lic.usageLimit == null ? `${lic.currentUsage}/∞` : `${lic.currentUsage}/${lic.usageLimit}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lic.status !== "active" || isExpired
                                                ? "bg-error/20 text-error"
                                                : "bg-success/20 text-success"
                                                }`}>
                                                {lic.status !== "active" ? t("inactive") : isExpired ? t("expired") : t("active")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-tertiary">
                                            {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString("vi-VN") : "∞"}
                                        </td>
                                        <td className="px-6 py-4">
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
                                        </td>
                                    </tr>
                                );
                            })}
                            {licenses.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-6 py-8 text-center text-text-tertiary text-sm">
                                        {t("noData")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
