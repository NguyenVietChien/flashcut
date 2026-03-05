"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSfx, updateSfx, deleteSfx } from "./actions";
import {
    Plus, Pencil, Trash2, Play, Pause, Upload, Sparkles, Search,
    Loader2, AlertCircle, ChevronDown, ChevronUp, Key, Music, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";

// ──────────────────────────── Types ────────────────────────────

interface SfxItem {
    id: string;
    name: string;
    filename: string;
    cloudinary_url: string;
    duration_sec: number | null;
    file_size_bytes: number | null;
    category: string | null;
    subcategory: string | null;
    mood: string | null;
    intensity: string | null;
    tags: string | null;
    description: string | null;
    use_cases: string | null;
    is_loop: number;
    created_at: string;
    updated_at: string;
}

interface Labels { [key: string]: string }

function moodBadgeClass(mood: string | null): string {
    if (!mood) return "bg-bg-tertiary text-text-secondary border-border-default";
    switch (mood.toLowerCase()) {
        case "tense": case "dark": case "scary":
            return "bg-error/15 text-error border-error/30";
        case "happy": case "upbeat": case "fun":
            return "bg-success/15 text-success border-success/30";
        case "calm": case "peaceful": case "ambient":
            return "bg-info/15 text-info border-info/30";
        case "epic": case "powerful": case "dramatic":
            return "bg-purple-500/15 text-purple-400 border-purple-500/30";
        default:
            return "bg-accent/15 text-accent border-accent/30";
    }
}

function intensityBadgeClass(intensity: string | null): string {
    switch (intensity) {
        case "high": return "bg-error/15 text-error border-error/30";
        case "medium": return "bg-warning/15 text-warning border-warning/30";
        case "low": return "bg-success/15 text-success border-success/30";
        default: return "bg-bg-tertiary text-text-secondary border-border-default";
    }
}

// ──────────────────────────── Main ────────────────────────────

export function SfxAdminClient({
    initialItems, labels: t, dbError, total, categories, moods,
}: {
    initialItems: SfxItem[];
    labels: Labels;
    dbError?: string;
    total: number;
    categories: string[];
    moods: string[];
}) {
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState<SfxItem | null>(null);
    const [geminiKey, setGeminiKey] = useState("");
    const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
    const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Fetch available models when key changes
    useEffect(() => {
        if (!geminiKey || geminiKey.length < 10) { setAvailableModels([]); return; }
        const timer = setTimeout(async () => {
            setLoadingModels(true);
            try {
                const res = await fetch("/api/admin/sfx/models", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ geminiKey }),
                });
                const data = await res.json();
                if (data.models) setAvailableModels(data.models);
            } catch { /* silent */ } finally { setLoadingModels(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [geminiKey]);

    const handleSuccess = () => {
        setShowCreate(false);
        setEditItem(null);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">{t.sfx}</h1>
                    <p className="text-sm text-text-tertiary mt-1">{t.sfxSubtitle}</p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="size-4" /> {t.addSfx}
                </Button>
            </div>

            {/* DB Error */}
            {dbError && (
                <div className="glass-card p-4 border-error/30">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="size-5 text-error shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-error">Database Error</p>
                            <p className="text-xs text-text-secondary mt-1">{dbError}</p>
                            <p className="text-xs text-text-tertiary mt-1">Make sure TURSO_SFX_URL and TURSO_SFX_TOKEN are set and migration has been run.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* FilterBar */}
            <FilterBar
                searchPlaceholder={t.searchPlaceholder}
                filters={[
                    ...(categories.length > 0 ? [{
                        key: "category",
                        label: "Category",
                        allLabel: `All ${t.category}`,
                        options: categories.map(c => ({ value: c, label: c })),
                    }] : []),
                    ...(moods.length > 0 ? [{
                        key: "mood",
                        label: "Mood",
                        allLabel: `All ${t.mood}`,
                        options: moods.map(m => ({ value: m, label: m })),
                    }] : []),
                ]}
                sortOptions={[
                    { value: "", label: "Newest" },
                    { value: "oldest", label: "Oldest" },
                    { value: "name_asc", label: "Name A-Z" },
                    { value: "name_desc", label: "Name Z-A" },
                ]}
                totalLabel={`${total} ${t.sfxTotal}`}
            />

            {/* Controls Bar */}
            <div className="flex items-center gap-2">
                <Button
                    variant={geminiKey ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className={geminiKey ? "bg-success/15 text-success border-success/30 hover:bg-success/25" : ""}
                >
                    <Key className="size-3.5" /> {t.geminiKey} {geminiKey ? "✓" : ""}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)}>
                    <Search className="size-3.5" /> {t.searchTest}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                        try {
                            const res = await fetch("/api/admin/sfx/sync-pinecone", { method: "POST" });
                            const data = await res.json();
                            alert(data.message || data.error || "Done");
                        } catch { alert("Sync failed"); }
                    }}
                >
                    Sync Pinecone
                </Button>
            </div>

            {/* Gemini Key + Model Selector */}
            {showGeminiKey && (
                <div className="glass-card p-4 space-y-3">
                    <label className="block text-sm font-medium text-text-primary">{t.geminiKey}</label>
                    <Input type="text" autoComplete="off" data-1p-ignore data-lpignore="true" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIzaSy..." className="font-mono text-xs tracking-wider" />
                    {availableModels.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Model</label>
                            <Select value={geminiModel} onValueChange={setGeminiModel}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableModels.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {loadingModels && <p className="text-xs text-text-tertiary">Loading models...</p>}
                    <p className="text-xs text-text-tertiary">{t.geminiKeyHint}</p>
                </div>
            )}

            {/* Search Tester */}
            {showSearch && <SearchTester t={t} geminiKey={geminiKey} geminiModel={geminiModel} />}

            {/* Table */}
            {initialItems.length === 0 && !dbError ? (
                <div className="glass-card flex flex-col items-center justify-center py-20">
                    <div className="size-14 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
                        <Music className="size-7 text-text-tertiary" />
                    </div>
                    <p className="text-text-tertiary">{t.noSfx}</p>
                    <Button className="mt-4" onClick={() => setShowCreate(true)}>
                        <Plus className="size-4" /> {t.addSfx}
                    </Button>
                </div>
            ) : initialItems.length > 0 && (
                <SfxTable items={initialItems} t={t} onEdit={setEditItem} />
            )}

            {/* Pagination */}
            <Pagination total={total} />

            {/* Create Dialog */}
            <SfxDialog
                key={showCreate ? "create" : "create-closed"}
                open={showCreate}
                mode="create"
                t={t}
                geminiKey={geminiKey}
                geminiModel={geminiModel}
                onClose={() => setShowCreate(false)}
                onSuccess={handleSuccess}
            />

            {/* Edit Dialog */}
            <SfxDialog
                key={editItem?.id || "edit-closed"}
                open={!!editItem}
                mode="edit"
                t={t}
                geminiKey={geminiKey}
                geminiModel={geminiModel}
                item={editItem ?? undefined}
                onClose={() => setEditItem(null)}
                onSuccess={handleSuccess}
                onDelete={() => { setEditItem(null); router.refresh(); }}
            />
        </div>
    );
}

// ──────────────────────────── Table ────────────────────────────

function SfxTable({ items, t, onEdit }: { items: SfxItem[]; t: Labels; onEdit: (item: SfxItem) => void }) {
    return (
        <div className="rounded-xl border border-border-default bg-bg-secondary/50 overflow-hidden">
            <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow className="border-border-default hover:bg-transparent">
                            <TableHead className="text-text-tertiary">{t.sfxName}</TableHead>
                            <TableHead className="text-text-tertiary">{t.category}</TableHead>
                            <TableHead className="text-text-tertiary">{t.mood}</TableHead>
                            <TableHead className="text-text-tertiary">{t.tags}</TableHead>
                            <TableHead className="text-text-tertiary">{t.durationSec}</TableHead>
                            <TableHead className="text-text-tertiary">{t.preview}</TableHead>
                            <TableHead className="text-text-tertiary">{t.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <SfxRow key={item.id} item={item} t={t} onEdit={onEdit} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function SfxRow({ item, t, onEdit }: { item: SfxItem; t: Labels; onEdit: (item: SfxItem) => void }) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) audioRef.current.pause();
        else audioRef.current.play();
        setPlaying(!playing);
    };

    const parseTags = (tags: string | null): string[] => {
        if (!tags) return [];
        try { return JSON.parse(tags); } catch { return tags.split(",").map(s => s.trim()); }
    };

    return (
        <TableRow className="border-border-default hover:bg-bg-hover/50 transition-colors">
            <TableCell>
                <p className="text-sm text-text-primary font-medium">{item.name}</p>
                <p className="text-xs text-text-tertiary">{item.filename}</p>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30">{item.category || "-"}</Badge>
                {item.subcategory && <span className="ml-1.5 text-xs text-text-tertiary">/ {item.subcategory}</span>}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={moodBadgeClass(item.mood)}>{item.mood || "-"}</Badge>
                    {item.intensity && (
                        <Badge variant="outline" className={intensityBadgeClass(item.intensity)}>{item.intensity}</Badge>
                    )}
                </div>
            </TableCell>
            <TableCell className="max-w-[200px]">
                <div className="flex flex-wrap gap-1">
                    {parseTags(item.tags).slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="bg-bg-tertiary text-text-secondary border-border-default text-xs font-normal">{tag}</Badge>
                    ))}
                    {parseTags(item.tags).length > 3 && (
                        <span className="text-xs text-text-tertiary">+{parseTags(item.tags).length - 3}</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-sm text-text-secondary tabular-nums">
                {item.duration_sec ? `${item.duration_sec.toFixed(1)}s` : "-"}
            </TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" onClick={togglePlay} className={playing ? "text-accent" : ""}>
                    {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                </Button>
                <audio ref={audioRef} src={item.cloudinary_url} onEnded={() => setPlaying(false)} preload="none" />
            </TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title={t.editSfx}>
                    <Pencil className="size-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}

// ──────────────────────────── Dialog ────────────────────────────

function SfxDialog({
    open, mode, t, geminiKey, geminiModel, item, onClose, onSuccess, onDelete,
}: {
    open: boolean;
    mode: "create" | "edit";
    t: Labels;
    geminiKey: string;
    geminiModel: string;
    item?: SfxItem;
    onClose: () => void;
    onSuccess: () => void;
    onDelete?: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState(item?.name || "");
    const [filename, setFilename] = useState(item?.filename || "");
    const [cloudinaryUrl, setCloudinaryUrl] = useState(item?.cloudinary_url || "");
    const [durationSec, setDurationSec] = useState(item?.duration_sec?.toString() || "");
    const [fileSizeBytes, setFileSizeBytes] = useState(item?.file_size_bytes?.toString() || "");
    const [category, setCategory] = useState(item?.category || "");
    const [subcategory, setSubcategory] = useState(item?.subcategory || "");
    const [mood, setMood] = useState(item?.mood || "");
    const [intensity, setIntensity] = useState(item?.intensity || "");
    const [tags, setTags] = useState(item?.tags || "");
    const [description, setDescription] = useState(item?.description || "");
    const [useCases, setUseCases] = useState(item?.use_cases || "");
    const [isLoop, setIsLoop] = useState(item?.is_loop === 1);
    const [showMetadata, setShowMetadata] = useState(mode === "edit");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        setUploading(true); setError("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/sfx/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setCloudinaryUrl(data.url);
            setFilename(data.filename);
            if (data.duration) setDurationSec(data.duration.toString());
            if (data.bytes) setFileSizeBytes(data.bytes.toString());
            if (!name) setName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
            // Auto-trigger Gemini analysis if key is set
            if (geminiKey && data.url) {
                setUploading(false);
                await handleAnalyze(data.url);
                return;
            }
        } catch (e: any) { setError(e.message); } finally { setUploading(false); }
    };

    const handleAnalyze = async (urlOverride?: string) => {
        const audioUrl = urlOverride || cloudinaryUrl;
        if (!audioUrl) { setError(t.uploadFirst); return; }
        if (!geminiKey) { setError("Set Gemini API Key first"); return; }
        setAnalyzing(true); setError("");
        try {
            const res = await fetch("/api/admin/sfx/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audioUrl, geminiKey, model: geminiModel }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (data.category) setCategory(data.category);
            if (data.subcategory) setSubcategory(data.subcategory);
            if (data.mood) setMood(data.mood);
            if (data.intensity) setIntensity(data.intensity);
            if (data.tags) setTags(typeof data.tags === "string" ? data.tags : JSON.stringify(data.tags));
            if (data.description) setDescription(data.description);
            if (data.use_cases) setUseCases(data.use_cases);
            setShowMetadata(true);
        } catch (e: any) { setError(e.message); } finally { setAnalyzing(false); }
    };

    const handleSubmit = () => {
        setError("");
        if (!name || (mode === "create" && !cloudinaryUrl)) { setError("Name and audio file are required"); return; }
        startTransition(async () => {
            const formData = new FormData();
            if (item) formData.append("id", item.id);
            formData.append("name", name);
            formData.append("filename", filename);
            formData.append("cloudinaryUrl", cloudinaryUrl);
            formData.append("durationSec", durationSec);
            formData.append("fileSizeBytes", fileSizeBytes);
            formData.append("category", category);
            formData.append("subcategory", subcategory);
            formData.append("mood", mood);
            formData.append("intensity", intensity);
            formData.append("tags", tags);
            formData.append("description", description);
            formData.append("useCases", useCases);
            formData.append("isLoop", isLoop.toString());
            const action = mode === "create" ? createSfx : updateSfx;
            const result = await action(formData);
            if (result.error) { setError(result.error); return; }
            onSuccess();
        });
    };

    const handleDelete = () => {
        if (!item || !onDelete) return;
        if (!confirm(t.deleteSfx + "?")) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append("id", item.id);
            const result = await deleteSfx(formData);
            if (result.error) { setError(result.error); return; }
            onDelete();
        });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                // Cleanup orphaned Cloudinary upload if user cancels without saving
                if (mode === "create" && cloudinaryUrl) {
                    fetch("/api/admin/sfx/delete-upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cloudinaryUrl }),
                    }).catch(() => { }); // Fire-and-forget
                }
                onClose();
            }
        }}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-accent/15 flex items-center justify-center">
                            <Volume2 className="size-4 text-accent" />
                        </div>
                        {mode === "create" ? t.addSfx : t.editSfx}
                    </DialogTitle>
                    <DialogDescription>{t.sfxSubtitle}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {error && (
                        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm flex items-center gap-2 text-error">
                            <AlertCircle className="size-4 shrink-0" /> {error}
                        </div>
                    )}

                    {/* Upload */}
                    {mode === "create" && (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">{t.uploadAudio}</label>
                            <input ref={fileInputRef} type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="hidden" />
                            {cloudinaryUrl ? (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                                    <div className="size-8 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
                                        <Music className="size-4 text-success" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">{filename}</p>
                                        <audio controls src={cloudinaryUrl} className="w-full mt-2 h-8" preload="none" />
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full h-auto flex flex-col items-center justify-center gap-2 px-4 py-10 border-2 border-dashed border-border-default rounded-xl hover:border-accent hover:bg-accent/5 text-text-tertiary group"
                                >
                                    <div className="size-12 rounded-xl bg-bg-tertiary flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                                        {uploading ? <Loader2 className="size-5 animate-spin text-accent" /> : <Upload className="size-5 text-text-tertiary group-hover:text-accent transition-colors" />}
                                    </div>
                                    <span className="text-sm">{uploading ? "Uploading..." : "Click to upload MP3, WAV, OGG (max 10MB)"}</span>
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Preview for edit */}
                    {mode === "edit" && cloudinaryUrl && (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">{t.preview}</label>
                            <div className="rounded-lg bg-bg-tertiary border border-border-default p-3">
                                <audio controls src={cloudinaryUrl} className="w-full h-8" preload="none" />
                            </div>
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">{t.sfxName} *</label>
                        <Input autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sword slash metal" />
                    </div>

                    {/* Gemini Analyze */}
                    {cloudinaryUrl && geminiKey && (
                        <Button
                            onClick={() => handleAnalyze()}
                            disabled={analyzing}
                            className="w-full text-white cursor-pointer"
                            style={{
                                background: "linear-gradient(135deg, #7c3aed, #2563eb, #0891b2)",
                                backgroundSize: "200% 200%",
                                animation: analyzing ? "none" : "gradient-shift 4s ease infinite",
                            }}
                        >
                            {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                            {analyzing ? t.analyzing : t.analyze}
                        </Button>
                    )}

                    {/* Metadata Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMetadata(!showMetadata)}
                        className="text-text-tertiary hover:text-text-primary px-0"
                    >
                        {showMetadata ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        Metadata
                    </Button>

                    {showMetadata && (
                        <div className="space-y-3 p-4 rounded-xl bg-bg-tertiary/50 border border-border-default">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">{t.category}</label>
                                    <Input autoComplete="off" value={category} onChange={e => setCategory(e.target.value)} className="h-8 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">{t.subcategory}</label>
                                    <Input autoComplete="off" value={subcategory} onChange={e => setSubcategory(e.target.value)} className="h-8 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">{t.mood}</label>
                                    <Input autoComplete="off" value={mood} onChange={e => setMood(e.target.value)} className="h-8 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">{t.intensity}</label>
                                    <Select value={intensity} onValueChange={setIntensity}>
                                        <SelectTrigger size="sm" className="w-full">
                                            <SelectValue placeholder="-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">{t.tags}</label>
                                <Input autoComplete="off" value={tags} onChange={e => setTags(e.target.value)} placeholder='["sword","metal","slash"]' className="h-8 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">{t.description}</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-1.5 bg-bg-tertiary border border-border-default rounded-md text-sm text-text-primary outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20 resize-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Use Cases</label>
                                <textarea
                                    value={useCases}
                                    onChange={e => setUseCases(e.target.value)}
                                    rows={2}
                                    placeholder="action movie, anime battle, game combat, phim hành động..."
                                    className="w-full px-3 py-1.5 bg-bg-tertiary border border-border-default rounded-md text-sm text-text-primary outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20 resize-none transition-all"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                                <input type="checkbox" checked={isLoop} onChange={e => setIsLoop(e.target.checked)} className="rounded border-border-default" />
                                {t.isLoop}
                            </label>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-row justify-between sm:justify-between">
                    {mode === "edit" && onDelete ? (
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                            <Trash2 className="size-3.5" /> {t.deleteSfx}
                        </Button>
                    ) : <div />}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
                        <Button onClick={handleSubmit} disabled={isPending || !name || (mode === "create" && !cloudinaryUrl)}>
                            {isPending ? <Loader2 className="size-4 animate-spin" /> : mode === "create" ? t.create : t.save}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ──────────────────────────── Search ────────────────────────────

function SearchTester({ t, geminiKey, geminiModel }: { t: Labels; geminiKey: string; geminiModel: string }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [method, setMethod] = useState("");

    const handleSearch = async () => {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await fetch("/api/admin/sfx/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, geminiKey: geminiKey || undefined, model: geminiModel || undefined }),
            });
            const data = await res.json();
            if (res.ok) {
                setResults(data.results || []);
                setSearchTerms(data.searchTerms || []);
                setMethod(data.method || "");
            }
        } catch { /* silent */ } finally { setSearching(false); }
    };

    return (
        <div className="glass-card p-4 space-y-4">
            <div className="flex gap-2">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t.searchPlaceholder}
                    className="flex-1"
                />
                <Button onClick={handleSearch} disabled={searching || !query.trim()}>
                    {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                    {t.searchTest}
                </Button>
            </div>

            {searchTerms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-text-tertiary">Keywords:</span>
                    {searchTerms.map((term, i) => (
                        <Badge key={i} variant="outline" className="bg-accent/15 text-accent border-accent/30 text-xs">{term}</Badge>
                    ))}
                    {method && <span className="text-xs text-text-tertiary ml-1">({method})</span>}
                </div>
            )}

            {results.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-text-primary">{t.searchResults} ({results.length})</p>
                    {results.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50 border border-border-default hover:border-border-hover transition-colors">
                            <AudioMiniPlayer url={r.cloudinary_url} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">{r.name}</p>
                                <p className="text-xs text-text-tertiary">{r.category} / {r.subcategory} · {r.mood}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : searchTerms.length > 0 ? (
                <p className="text-sm text-text-tertiary">{t.noResults}</p>
            ) : null}
        </div>
    );
}

// ──────────────────────────── Mini Audio Player ────────────────────────────

function AudioMiniPlayer({ url }: { url: string }) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const toggle = () => {
        if (!audioRef.current) return;
        if (playing) audioRef.current.pause();
        else audioRef.current.play();
        setPlaying(!playing);
    };

    return (
        <>
            <Button variant="ghost" size="icon" onClick={toggle} className={playing ? "text-accent" : ""}>
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} preload="none" />
        </>
    );
}
