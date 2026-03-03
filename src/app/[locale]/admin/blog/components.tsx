"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import {
    ArrowLeft,
    Save,
    Upload,
    Loader2,
    Globe,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const ForwardRefEditor = dynamic(
    () => import("@/components/admin/InitializedMDXEditor"),
    { ssr: false }
);

interface PostData {
    slug: string;
    locale: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: number;
    category: string;
    coverGradient: string;
    coverImage: string;
    content: string;
}

const CATEGORIES = [
    { value: "tutorial", label: "Tutorial" },
    { value: "guide", label: "Guide" },
    { value: "tips", label: "Tips & Tricks" },
    { value: "news", label: "News" },
    { value: "update", label: "Update" },
];

const GRADIENTS = [
    "from-accent/40 to-cyan-600/40",
    "from-purple-500/40 to-pink-500/40",
    "from-emerald-500/40 to-teal-500/40",
    "from-orange-500/40 to-red-500/40",
    "from-blue-500/40 to-indigo-500/40",
];

/* ─── Blog Editor Component ─── */
export function BlogEditor({
    initialData,
    locale,
    adminLocale,
    labels,
}: {
    initialData?: PostData;
    locale: string;
    adminLocale: string;
    labels: Record<string, string>;
}) {
    const isEditing = !!initialData;
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const editorRef = useRef<MDXEditorMethods>(null);

    const [form, setForm] = useState<PostData>({
        slug: initialData?.slug || "",
        locale: initialData?.locale || locale,
        title: initialData?.title || "",
        excerpt: initialData?.excerpt || "",
        date: initialData?.date || new Date().toISOString().split("T")[0],
        readTime: initialData?.readTime || 5,
        category: initialData?.category || "guide",
        coverGradient: initialData?.coverGradient || GRADIENTS[0],
        coverImage: initialData?.coverImage || "",
        content: initialData?.content || "",
    });

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEditing && form.title) {
            const slug = form.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            setForm((prev) => ({ ...prev, slug }));
        }
    }, [form.title, isEditing]);

    const updateField = (field: string, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    // Upload image handler for MDXEditor
    const imageUploadHandler = useCallback(
        async (image: File): Promise<string> => {
            setUploading(true);
            try {
                const fd = new FormData();
                fd.append("file", image);
                const res = await fetch("/api/admin/blog/upload", {
                    method: "POST",
                    body: fd,
                });
                const data = await res.json();
                if (data.url) {
                    return data.url as string;
                }
                throw new Error(data.error || "Upload failed");
            } catch (e) {
                alert(e instanceof Error ? e.message : "Upload failed");
                return "";
            } finally {
                setUploading(false);
            }
        },
        []
    );

    // Set as cover image
    const setCoverImage = useCallback(
        async (file: File) => {
            setUploading(true);
            try {
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/admin/blog/upload", {
                    method: "POST",
                    body: fd,
                });
                const data = await res.json();
                if (data.url) {
                    setForm((prev) => ({ ...prev, coverImage: data.url }));
                }
            } catch {
                alert("Upload failed");
            } finally {
                setUploading(false);
            }
        },
        []
    );

    // Save post
    const handleSave = async () => {
        if (!form.title || !form.slug) {
            alert(labels.titleRequired || "Title is required");
            return;
        }

        // Get latest markdown from editor
        const content = editorRef.current?.getMarkdown() || form.content;

        setSaving(true);
        try {
            const method = isEditing ? "PUT" : "POST";
            const res = await fetch("/api/admin/blog", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, content }),
            });
            const data = await res.json();
            if (data.success) {
                setSaved(true);
                if (!isEditing) {
                    window.location.href = `/${adminLocale}/admin/blog`;
                }
            } else {
                alert(data.error || "Save failed");
            }
        } catch {
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${adminLocale}/admin/blog`}
                        className="p-2 rounded-lg hover:bg-bg-hover text-text-tertiary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-text-primary">
                        {isEditing ? labels.editPost : labels.newPost}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-accent text-black hover:bg-accent/90 gap-2"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? labels.saving : saved ? labels.saved : labels.save}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Title */}
                    <Input
                        type="text"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder={labels.titlePlaceholder}
                        className="h-auto px-4 py-3 bg-bg-secondary border-border-default text-text-primary text-xl font-bold rounded-xl"
                    />

                    {/* Excerpt */}
                    <textarea
                        value={form.excerpt}
                        onChange={(e) => updateField("excerpt", e.target.value)}
                        placeholder={labels.excerptPlaceholder}
                        rows={2}
                        className="w-full px-4 py-3 bg-bg-secondary border border-border-default rounded-xl text-text-secondary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none text-sm"
                    />

                    {/* MDXEditor */}
                    <div className="relative mdx-editor-wrapper">
                        {uploading && (
                            <div className="absolute inset-0 z-10 bg-bg-primary/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <div className="flex items-center gap-3 text-accent">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="text-sm font-medium">
                                        {labels.uploading}
                                    </span>
                                </div>
                            </div>
                        )}
                        <ForwardRefEditor
                            editorRef={editorRef}
                            markdown={form.content}
                            onChange={(v) => updateField("content", v)}
                            imageUploadHandler={imageUploadHandler}
                            contentEditableClassName="mdx-editor-content"
                        />
                    </div>
                </div>

                {/* Sidebar — Metadata */}
                <div className="space-y-4">
                    {/* Locale */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            {labels.language}
                        </label>
                        <Select value={form.locale} onValueChange={(val) => updateField("locale", val)} disabled={isEditing}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="vi">Tiếng Việt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Slug */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            Slug
                        </label>
                        <Input
                            type="text"
                            value={form.slug}
                            onChange={(e) => updateField("slug", e.target.value)}
                            disabled={isEditing}
                            className="text-sm font-mono"
                        />
                    </div>

                    {/* Date */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            {labels.date}
                        </label>
                        <Input
                            type="date"
                            value={form.date}
                            onChange={(e) => updateField("date", e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    {/* Category */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            {labels.category}
                        </label>
                        <Select value={form.category} onValueChange={(val) => updateField("category", val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Read Time */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            {labels.readTime}
                        </label>
                        <Input
                            type="number"
                            min={1}
                            max={60}
                            value={form.readTime}
                            onChange={(e) =>
                                updateField("readTime", parseInt(e.target.value) || 5)
                            }
                            className="text-sm"
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            {labels.coverImage}
                        </label>
                        {form.coverImage ? (
                            <div className="relative group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={form.coverImage}
                                    alt="Cover"
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => updateField("coverImage", "")}
                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-2 p-4 border border-dashed border-border-default rounded-lg cursor-pointer hover:border-accent hover:text-accent transition-colors text-text-tertiary">
                                <Upload className="w-5 h-5" />
                                <span className="text-xs">{labels.uploadCover}</span>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setCoverImage(file);
                                        e.target.value = "";
                                    }}
                                />
                            </label>
                        )}
                    </div>

                    {/* Cover Gradient */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            {labels.coverGradient}
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {GRADIENTS.map((g) => (
                                <button
                                    key={g}
                                    onClick={() => updateField("coverGradient", g)}
                                    className={`h-8 rounded-md bg-gradient-to-r ${g} border-2 transition-all cursor-pointer ${form.coverGradient === g
                                        ? "border-accent scale-110"
                                        : "border-transparent hover:border-border-default"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Delete Post Button ─── */
export function DeletePostButton({
    slug,
    locale,
    labels,
    adminLocale,
}: {
    slug: string;
    locale: string;
    labels: Record<string, string>;
    adminLocale: string;
}) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch("/api/admin/blog", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, locale }),
            });
            window.location.href = `/${adminLocale}/admin/blog`;
        } catch {
            alert("Delete failed");
            setDeleting(false);
        }
    };

    if (confirming) {
        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs px-2 py-1 rounded bg-error/20 text-error hover:bg-error/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {deleting ? "..." : labels.confirm}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
                >
                    {labels.cancel}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="action-btn text-error"
            title={labels.delete}
        >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    );
}
