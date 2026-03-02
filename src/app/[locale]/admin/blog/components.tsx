"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    Save,
    Upload,
    Image as ImageIcon,
    Loader2,
    Eye,
    Edit3,
    Globe,
} from "lucide-react";
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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
    const [previewMode, setPreviewMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Upload image
    const uploadImage = useCallback(
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
                    return data.url as string;
                }
                alert(data.error || "Upload failed");
                return null;
            } catch {
                alert("Upload failed");
                return null;
            } finally {
                setUploading(false);
            }
        },
        []
    );

    // Insert image into editor
    const insertImage = useCallback(
        async (file: File) => {
            const url = await uploadImage(file);
            if (url) {
                const imgMarkdown = `\n![${file.name.replace(/\.[^/.]+$/, "")}](${url})\n`;
                setForm((prev) => ({
                    ...prev,
                    content: prev.content + imgMarkdown,
                }));
            }
        },
        [uploadImage]
    );

    // Set as cover image
    const setCoverImage = useCallback(
        async (file: File) => {
            const url = await uploadImage(file);
            if (url) {
                setForm((prev) => ({ ...prev, coverImage: url }));
            }
        },
        [uploadImage]
    );

    // Handle drag & drop on editor
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.type.startsWith("image/")
            );
            if (files.length > 0) {
                insertImage(files[0]);
            }
        },
        [insertImage]
    );

    // Save post
    const handleSave = async () => {
        if (!form.title || !form.slug) {
            alert(labels.titleRequired || "Title is required");
            return;
        }

        setSaving(true);
        try {
            const method = isEditing ? "PUT" : "POST";
            const res = await fetch("/api/admin/blog", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
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
                    <h1 className="text-2xl font-bold text-text-primary">
                        {isEditing ? labels.editPost : labels.newPost}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default text-text-secondary hover:bg-bg-hover transition-colors text-sm cursor-pointer"
                    >
                        {previewMode ? (
                            <Edit3 className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                        {previewMode ? labels.edit : labels.preview}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? labels.saving : saved ? labels.saved : labels.save}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Title */}
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder={labels.titlePlaceholder}
                        className="w-full px-4 py-3 bg-bg-secondary border border-border-default rounded-xl text-text-primary text-xl font-bold placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />

                    {/* Excerpt */}
                    <textarea
                        value={form.excerpt}
                        onChange={(e) => updateField("excerpt", e.target.value)}
                        placeholder={labels.excerptPlaceholder}
                        rows={2}
                        className="w-full px-4 py-3 bg-bg-secondary border border-border-default rounded-xl text-text-secondary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none text-sm"
                    />

                    {/* Markdown Editor */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        data-color-mode="dark"
                        className="relative"
                    >
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
                        <MDEditor
                            value={form.content}
                            onChange={(v) => updateField("content", v || "")}
                            preview={previewMode ? "preview" : "edit"}
                            height={500}
                            className="!bg-bg-secondary !border-border-default rounded-xl overflow-hidden"
                        />
                    </div>

                    {/* Image insert button */}
                    <div className="flex items-center gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) insertImage(file);
                                e.target.value = "";
                            }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border-default text-text-tertiary hover:text-accent hover:border-accent transition-colors text-sm cursor-pointer"
                        >
                            <ImageIcon className="w-4 h-4" />
                            {labels.insertImage}
                        </button>
                        <span className="text-xs text-text-tertiary">
                            {labels.dragDropHint}
                        </span>
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
                        <select
                            value={form.locale}
                            onChange={(e) => updateField("locale", e.target.value)}
                            disabled={isEditing}
                            className="input-field text-sm"
                        >
                            <option value="en">English</option>
                            <option value="vi">Tiếng Việt</option>
                        </select>
                    </div>

                    {/* Slug */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            Slug
                        </label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => updateField("slug", e.target.value)}
                            disabled={isEditing}
                            className="input-field text-sm font-mono"
                        />
                    </div>

                    {/* Date */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            {labels.date}
                        </label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => updateField("date", e.target.value)}
                            className="input-field text-sm"
                        />
                    </div>

                    {/* Category */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            {labels.category}
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) => updateField("category", e.target.value)}
                            className="input-field text-sm"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Read Time */}
                    <div className="bg-bg-secondary border border-border-default rounded-xl p-4 space-y-3">
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                            {labels.readTime}
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={60}
                            value={form.readTime}
                            onChange={(e) =>
                                updateField("readTime", parseInt(e.target.value) || 5)
                            }
                            className="input-field text-sm"
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
