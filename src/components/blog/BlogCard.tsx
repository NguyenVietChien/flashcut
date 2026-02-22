"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";

interface BlogCardProps {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: number;
    category: string;
    coverGradient: string;
    index: number;
}

const categoryColors: Record<string, string> = {
    tutorial: "bg-accent/20 text-accent",
    guide: "bg-purple-500/20 text-purple-400",
    tips: "bg-emerald-500/20 text-emerald-400",
};

export default function BlogCard({
    slug,
    title,
    excerpt,
    date,
    readTime,
    category,
    coverGradient,
    index,
}: BlogCardProps) {
    const t = useTranslations("blog");

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className="group h-full"
        >
            <Link href={`/blog/${slug}`} className="block h-full">
                <article className="glass-card overflow-hidden h-full flex flex-col">
                    <div className={`h-40 bg-gradient-to-br ${coverGradient} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNGM3LjczMiAwIDE0IDYuMjY4IDE0IDE0cy02LjI2OCAxNC0xNCAxNHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent"
                            initial={{ opacity: 0.6 }}
                            whileHover={{ opacity: 0.8 }}
                        />

                        <div className="absolute top-3 left-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[category] ?? categoryColors.guide}`}>
                                {category}
                            </span>
                        </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                            {title}
                        </h3>

                        <p className="text-text-secondary text-sm mb-4 flex-1 line-clamp-2">
                            {excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-text-tertiary">
                            <div className="flex items-center gap-3">
                                <span>{date}</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{readTime} {t("minRead")}</span>
                                </div>
                            </div>

                            <span className="flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                {t("readMore")} <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                    </div>
                </article>
            </Link>
        </motion.div>
    );
}
