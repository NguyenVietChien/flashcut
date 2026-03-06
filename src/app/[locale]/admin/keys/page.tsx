import { getTranslations } from "next-intl/server";
import { KeysAdminClient } from "./components";
import { Suspense } from "react";

async function KeysContent() {
    const t = await getTranslations("admin");

    let models: any[] = [];
    let error = "";

    try {
        // Server-side fetch via litellm client (avoids exposing master key)
        const { getModels } = await import("@/lib/litellm");
        models = await getModels();
    } catch (e: any) {
        error = e.message || "Failed to fetch keys from LiteLLM";
    }

    const labels = {
        keysTitle: t("keysTitle"),
        keysSubtitle: t("keysSubtitle"),
        addKey: t("addKey"),
        addKeyDesc: t("addKeyDesc"),
        totalKeys: t("totalKeys"),
        providers: t("providers"),
        dbKeys: t("dbKeys"),
        configKeys: t("configKeys"),
        noKeys: t("noKeys"),
        provider: t("provider"),
        modelName: t("modelName"),
        model: t("model"),
        apiKey: t("apiKey"),
        source: t("source"),
        actions: t("actions"),
        delete: t("delete"),
        configOnly: t("configOnly"),
        confirmDelete: t("confirmDelete"),
        deleteWarning: t("deleteWarning"),
        deleting: t("deleting"),
        selectProvider: t("selectProvider"),
        selectModel: t("selectModel"),
        alias: t("alias"),
        adding: t("adding"),
        cancel: t("cancel"),
    };

    return <KeysAdminClient initialModels={models} labels={labels} fetchError={error} />;
}

export default async function KeysAdminPage() {
    return (
        <Suspense>
            <KeysContent />
        </Suspense>
    );
}
