import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { ProductRow, CreateProductButton } from "./components";

export default async function AdminProductsPage() {
    const t = await getTranslations("admin");

    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            plans: { orderBy: { priceVnd: "asc" } },
            _count: { select: { orders: true, licenses: true } },
        },
    });

    const labels = {
        // Product labels
        addProduct: t("addProduct"),
        editProduct: t("editProduct"),
        deleteProduct: t("deleteProduct"),
        cannotDelete: t("cannotDelete"),
        productName: t("productName"),
        productType: t("productType"),
        description: t("description"),
        descriptionPlaceholder: t("descriptionPlaceholder"),
        slugHint: t("slugHint"),
        // Plan labels
        plans: t("plans"),
        addPlan: t("addPlan"),
        editPlan: t("editPlan"),
        deletePlan: t("deletePlan"),
        planName: t("planName"),
        priceVnd: t("priceVnd"),
        priceUsd: t("priceUsd"),
        duration: t("duration"),
        durationHint: t("durationHint"),
        maxActivations: t("maxActivations"),
        usageLimit: t("usageLimit"),
        usageLimitHint: t("usageLimitHint"),
        noPlans: t("noPlans"),
        days: t("days"),
        optional: t("optional"),
        // Common labels
        status: t("status"),
        active: t("active"),
        inactive: t("inactive"),
        actions: t("actions"),
        cancel: t("cancel"),
        save: t("save"),
        confirm: t("confirm"),
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{t("products")}</h1>
                    <p className="text-sm text-text-tertiary mt-1">{t("productsSubtitle")}</p>
                </div>
                <CreateProductButton labels={labels} />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-default">
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("productName")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">Slug</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("productType")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("plans")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("status")}</th>
                                <th className="text-left text-xs font-medium text-text-tertiary uppercase tracking-wider px-6 py-4">{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                            {products.map((product) => (
                                <ProductRow key={product.id} product={product} labels={labels} />
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div className="text-center py-12 text-text-tertiary">
                            <p>{t("noProducts")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
