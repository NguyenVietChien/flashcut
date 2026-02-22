import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPost } from "./types";

const POSTS_DIR = path.join(process.cwd(), "src/content/blog");

function getPostFiles(locale: string): string[] {
    const dir = path.join(POSTS_DIR, locale);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

function parsePost(filename: string, locale: string): BlogPost {
    const filePath = path.join(POSTS_DIR, locale, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
        slug: filename.replace(/\.mdx$/, ""),
        title: data.title ?? "",
        excerpt: data.excerpt ?? "",
        date: data.date ?? new Date().toISOString().split("T")[0],
        readTime: data.readTime ?? Math.ceil(content.split(/\s+/).length / 200),
        category: data.category ?? "guide",
        coverGradient: data.coverGradient ?? "from-accent/40 to-cyan-600/40",
        locale,
        content,
    };
}

export function getAllPosts(locale: string): BlogPost[] {
    return getPostFiles(locale)
        .map((f) => parsePost(f, locale))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, locale: string): BlogPost | null {
    const filename = `${slug}.mdx`;
    const filePath = path.join(POSTS_DIR, locale, filename);
    if (!fs.existsSync(filePath)) return null;
    return parsePost(filename, locale);
}

export function getAllSlugs(locale: string): string[] {
    return getPostFiles(locale).map((f) => f.replace(/\.mdx$/, ""));
}
