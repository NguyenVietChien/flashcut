import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { CreateLicenseButton, EditLicenseButton, ResetHwidButton, DeleteLicenseButton } from "./components";

export default async function AdminLicensesPage() {
    const t = await getTranslations("admin");

    const licenses = await prisma.license.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            product: true,
            user: { select: { name: true, email: true } },
            _count: { select: { activationLogs: true } },
        },
    });

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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Licenses</h1>
                    <p className="text-sm text-text-tertiary mt-1">{licenses.length} {t("total")}</p>
                </div>
                <CreateLicenseButton labels={labels} />
            </div>

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
        </div>
    );
}
