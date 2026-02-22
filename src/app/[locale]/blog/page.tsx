import { getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/blog/api";
import BlogCard from "@/components/blog/BlogCard";
import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isVi = locale === "vi";
    return {
        title: isVi ? "Blog — FlashCut.ai" : "Blog — FlashCut.ai",
        description: isVi
            ? "Tin tức, hướng dẫn và mẹo hay từ đội ngũ FlashCut.ai"
            : "News, tutorials, and tips from the FlashCut.ai team",
        openGraph: {
            title: "Blog — FlashCut.ai",
            description: isVi
                ? "Tin tức, hướng dẫn và mẹo hay từ đội ngũ FlashCut.ai"
                : "News, tutorials, and tips from the FlashCut.ai team",
            url: `https://flashcut.ai/${locale}/blog`,
        },
    };
}

export default async function BlogPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations("blog");
    const posts = getAllPosts(locale);

    return (
        <section className="py-24 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
                        {t("title")}
                    </h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>

                {posts.length === 0 ? (
                    <p className="text-center text-text-secondary">
                        {t("noPosts")}
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post, i) => (
                            <BlogCard
                                key={post.slug}
                                slug={post.slug}
                                title={post.title}
                                excerpt={post.excerpt}
                                date={post.date}
                                readTime={post.readTime}
                                category={post.category}
                                coverGradient={post.coverGradient}
                                index={i}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
