import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { CreateLicenseButton, EditLicenseButton, ResetHwidButton, DeleteLicenseButton } from "./components";

export default async function AdminDesktopLicensesPage() {
    const t = await getTranslations("admin");

    const licenses = await prisma.desktopLicense.findMany({
        orderBy: { createdAt: "desc" },
        include: {
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

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{t("desktopLicenses")}</h1>
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
                                <th className="th-cell">Tier</th>
                                <th className="th-cell">HWID</th>
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
                                return (
                                    <tr key={lic.id} className="hover:bg-bg-hover transition-colors">
                                        <td className="px-6 py-4">
                                            <code className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                                                {lic.licenseKey}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lic.tier === "ultra" ? "bg-gold/20 text-gold" :
                                                    lic.tier === "pro" ? "bg-purple-500/20 text-purple-400" :
                                                        "bg-bg-tertiary text-text-secondary"
                                                }`}>
                                                {lic.tier.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-text-tertiary font-mono">
                                            {lic.hwidHash ? `${lic.hwidHash.substring(0, 12)}...` : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {lic.currentActivations}/{lic.maxActivations}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {lic.usageLimit === -1 ? `${lic.currentUsage}/∞` : `${lic.currentUsage}/${lic.usageLimit}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${!lic.isActive || isExpired
                                                    ? "bg-error/20 text-error"
                                                    : "bg-success/20 text-success"
                                                }`}>
                                                {!lic.isActive ? t("inactive") : isExpired ? t("expired") : t("active")}
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
                                                        usageLimit: lic.usageLimit,
                                                        isActive: lic.isActive,
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
