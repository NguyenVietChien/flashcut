"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Pencil, Loader2, RefreshCw } from "lucide-react";
import { DeletePostButton } from "./components";

interface PostItem {
    slug: string;
    locale: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
}

export default function AdminBlogPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const [locale, setLocale] = useState("en");
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Resolve params
    useEffect(() => {
        params.then((p) => setLocale(p.locale));
    }, [params]);

    const fetchPosts = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/blog");
            const data = await res.json();
            if (data.posts) {
                setPosts(data.posts);
            } else {
                setError(data.error || "Failed to load posts");
            }
        } catch {
            setError("Failed to connect to API");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-accent" />
                        </div>
                        Blog Manager
                    </h1>
                    <p className="text-sm text-text-tertiary mt-1">
                        {posts.length} posts total
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPosts}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border-default text-text-secondary hover:bg-bg-hover transition-colors text-sm cursor-pointer"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <Link
                        href={`/${locale}/admin/blog/editor`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Post
                    </Link>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-error/10 border border-error/20 rounded-xl px-5 py-3 text-error text-sm">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
            )}

            {/* Posts Table */}
            {!loading && (
                <div className="bg-bg-secondary border border-border-default rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-default">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                                    Title
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                                    Locale
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                                    Category
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                                    Date
                                </th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr
                                    key={`${post.locale}-${post.slug}`}
                                    className="border-b border-border-default last:border-0 hover:bg-bg-hover transition-colors"
                                >
                                    <td className="px-5 py-3.5">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">
                                                {post.title}
                                            </p>
                                            <p className="text-xs text-text-tertiary mt-0.5 truncate max-w-xs">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                            {post.locale.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-text-secondary capitalize">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-text-tertiary">
                                            {post.date}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/${locale}/admin/blog/editor?slug=${post.slug}&locale=${post.locale}`}
                                                className="action-btn"
                                                title="Edit"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <DeletePostButton
                                                slug={post.slug}
                                                locale={post.locale}
                                                labels={{
                                                    confirm: "Confirm",
                                                    cancel: "Cancel",
                                                    delete: "Delete",
                                                }}
                                                adminLocale={locale}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-12 text-center text-text-tertiary"
                                    >
                                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No blog posts yet</p>
                                        <Link
                                            href={`/${locale}/admin/blog/editor`}
                                            className="text-accent hover:underline text-sm mt-1 inline-block"
                                        >
                                            Create your first post →
                                        </Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Deploy note */}
            <p className="text-xs text-text-tertiary text-center">
                Changes commit to GitHub and auto-deploy via Vercel (~1 min)
            </p>
        </div>
    );
}
