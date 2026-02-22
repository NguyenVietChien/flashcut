import { useTranslations } from "next-intl";

export default function TermsPage() {
    const t = useTranslations("terms");

    const sections = [
        "usage",
        "license",
        "restrictions",
        "payment",
        "liability",
        "termination",
        "changes",
    ] as const;

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                    {t("title")}
                </h1>
                <p className="text-text-tertiary text-sm mb-10">
                    {t("lastUpdated")}
                </p>

                <div className="space-y-8">
                    <p className="text-text-secondary leading-relaxed">
                        {t("intro")}
                    </p>

                    {sections.map((key) => (
                        <section key={key}>
                            <h2 className="text-xl font-semibold text-text-primary mb-3">
                                {t(`${key}.title`)}
                            </h2>
                            <p className="text-text-secondary leading-relaxed">
                                {t(`${key}.content`)}
                            </p>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
