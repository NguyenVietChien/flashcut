"use client";

import { useState, useEffect } from "react";
import { BlogEditor } from "../components";

export default function BlogEditorPage({
    searchParams,
}: {
    searchParams: Promise<{ slug?: string; locale?: string }>;
}) {
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState(undefined as Record<string, unknown> | undefined);
    const [adminLocale, setAdminLocale] = useState("en");
    const [postLocale, setPostLocale] = useState("en");

    useEffect(() => {
        // Detect admin locale from URL
        const pathParts = window.location.pathname.split("/");
        const loc = pathParts[1] || "en";
        setAdminLocale(loc);

        searchParams.then(async (sp) => {
            const slug = sp.slug;
            const locale = sp.locale || loc;
            setPostLocale(locale);

            if (slug) {
                // Fetch post from API
                try {
                    const res = await fetch("/api/admin/blog");
                    const data = await res.json();
                    if (data.posts) {
                        const post = data.posts.find(
                            (p: Record<string, string>) => p.slug === slug && p.locale === locale
                        );
                        if (post) {
                            setInitialData(post);
                        }
                    }
                } catch {
                    console.error("Failed to fetch post");
                }
            }
            setLoading(false);
        });
    }, [searchParams]);

    const labels = {
        newPost: "New Post",
        editPost: "Edit Post",
        save: "Save",
        saving: "Saving...",
        saved: "Saved ✓",
        preview: "Preview",
        edit: "Edit",
        titlePlaceholder: "Enter post title...",
        excerptPlaceholder: "Brief description of the post...",
        titleRequired: "Title is required",
        language: "Language",
        date: "Date",
        category: "Category",
        readTime: "Read Time (min)",
        coverImage: "Cover Image",
        uploadCover: "Upload cover image",
        coverGradient: "Fallback Gradient",
        insertImage: "Insert Image",
        dragDropHint: "or drag & drop images into the editor",
        uploading: "Uploading...",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <BlogEditor
            initialData={initialData as Parameters<typeof BlogEditor>[0]["initialData"]}
            locale={postLocale}
            adminLocale={adminLocale}
            labels={labels}
        />
    );
}
