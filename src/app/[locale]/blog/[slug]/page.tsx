import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPostBySlug, getAllPosts } from "@/lib/blog/api";
import BlogContent from "@/components/blog/BlogContent";
import BlogCard from "@/components/blog/BlogCard";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const post = getPostBySlug(slug, locale);
    if (!post) return {};
    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `https://flashcut.ai/${locale}/blog/${slug}`,
            type: "article",
            publishedTime: post.date,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
        },
    };
}

export default async function BlogDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const t = await getTranslations("blog");
    const post = getPostBySlug(slug, locale);

    if (!post) notFound();

    const relatedPosts = getAllPosts(locale).filter((p) => p.slug !== slug).slice(0, 3);

    const categoryColors: Record<string, string> = {
        tutorial: "bg-accent/20 text-accent",
        guide: "bg-purple-500/20 text-purple-400",
        tips: "bg-emerald-500/20 text-emerald-400",
    };

    return (
        <article className="py-24 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-8 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("backToList")}
                </Link>

                <div className={`h-48 sm:h-56 rounded-2xl bg-gradient-to-br ${post.coverGradient} mb-8 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNGM3LjczMiAwIDE0IDYuMjY4IDE0IDE0cy02LjI2OCAxNC0xNCAxNHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
                </div>

                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category] ?? categoryColors.guide}`}>
                            <Tag className="w-3 h-3 inline mr-1" />
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                        {post.title}
                    </h1>

                    <p className="text-text-secondary text-lg mb-6">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-text-tertiary border-b border-border-default pb-6">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime} {t("minRead")}</span>
                        </div>
                    </div>
                </header>

                <BlogContent content={post.content} />
            </div>

            {relatedPosts.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-border-default">
                    <h2 className="text-2xl font-bold text-text-primary mb-8">
                        {t("relatedPosts")}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedPosts.map((p, i) => (
                            <BlogCard
                                key={p.slug}
                                slug={p.slug}
                                title={p.title}
                                excerpt={p.excerpt}
                                date={p.date}
                                readTime={p.readTime}
                                category={p.category}
                                coverGradient={p.coverGradient}
                                index={i}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-border-default">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("backToList")}
                </Link>
            </div>
        </article>
    );
}

