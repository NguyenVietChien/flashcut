import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const GITHUB_API = "https://api.github.com";

function getGitHubConfig() {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO; // e.g. "NguyenVietChien/flashcut"
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!token || !repo) return null;
    return { token, repo, branch };
}

function headers(token: string) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    };
}

// Build MDX content from frontmatter + body
function buildMdx(data: Record<string, unknown>, content: string): string {
    const lines = ["---"];
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "string") {
                lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
            } else {
                lines.push(`${key}: ${value}`);
            }
        }
    }
    lines.push("---");
    lines.push("");
    lines.push(content || "");
    return lines.join("\n");
}

// GET — List all posts from GitHub
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gh = getGitHubConfig();
    if (!gh) {
        return NextResponse.json({ error: "GitHub not configured" }, { status: 500 });
    }

    const posts: Record<string, unknown>[] = [];

    for (const locale of ["en", "vi"]) {
        const dirPath = `src/content/blog/${locale}`;
        const res = await fetch(
            `${GITHUB_API}/repos/${gh.repo}/contents/${dirPath}?ref=${gh.branch}`,
            { headers: headers(gh.token), cache: "no-store" }
        );

        if (!res.ok) continue;
        const files = await res.json();

        for (const file of files) {
            if (!file.name.endsWith(".mdx")) continue;

            const fileRes = await fetch(file.download_url, { cache: "no-store" });
            const raw = await fileRes.text();

            // Parse frontmatter manually
            const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (!fmMatch) continue;

            const frontmatter: Record<string, string> = {};
            for (const line of fmMatch[1].split("\n")) {
                const colonIdx = line.indexOf(":");
                if (colonIdx > 0) {
                    const key = line.slice(0, colonIdx).trim();
                    let val = line.slice(colonIdx + 1).trim();
                    // Remove surrounding quotes
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.slice(1, -1);
                    }
                    frontmatter[key] = val;
                }
            }

            posts.push({
                slug: file.name.replace(/\.mdx$/, ""),
                locale,
                title: frontmatter.title || "",
                excerpt: frontmatter.excerpt || "",
                date: frontmatter.date || "",
                readTime: parseInt(frontmatter.readTime || "5"),
                category: frontmatter.category || "",
                coverGradient: frontmatter.coverGradient || "",
                coverImage: frontmatter.coverImage || "",
                content: fmMatch[2].trim(),
                sha: file.sha, // needed for updates
            });
        }
    }

    posts.sort(
        (a, b) =>
            new Date(b.date as string).getTime() -
            new Date(a.date as string).getTime()
    );
    return NextResponse.json({ posts });
}

// POST — Create new post on GitHub
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gh = getGitHubConfig();
    if (!gh) {
        return NextResponse.json({ error: "GitHub not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { slug, locale, title, excerpt, date, readTime, category, coverGradient, coverImage, content } = body;

    if (!slug || !locale || !title) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const filePath = `src/content/blog/${locale}/${slug}.mdx`;
    const mdxContent = buildMdx(
        { title, excerpt, date, readTime, category, coverGradient, coverImage },
        content || ""
    );

    const res = await fetch(
        `${GITHUB_API}/repos/${gh.repo}/contents/${filePath}`,
        {
            method: "PUT",
            headers: headers(gh.token),
            body: JSON.stringify({
                message: `blog: add ${locale}/${slug}`,
                content: Buffer.from(mdxContent).toString("base64"),
                branch: gh.branch,
            }),
        }
    );

    if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err.message || "GitHub API error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug, locale });
}

// PUT — Update existing post on GitHub
export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gh = getGitHubConfig();
    if (!gh) {
        return NextResponse.json({ error: "GitHub not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { slug, locale, title, excerpt, date, readTime, category, coverGradient, coverImage, content, sha } = body;

    if (!slug || !locale) {
        return NextResponse.json({ error: "Missing slug or locale" }, { status: 400 });
    }

    const filePath = `src/content/blog/${locale}/${slug}.mdx`;

    // Get current file SHA if not provided
    let fileSha = sha;
    if (!fileSha) {
        const getRes = await fetch(
            `${GITHUB_API}/repos/${gh.repo}/contents/${filePath}?ref=${gh.branch}`,
            { headers: headers(gh.token) }
        );
        if (getRes.ok) {
            const fileData = await getRes.json();
            fileSha = fileData.sha;
        } else {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
    }

    const mdxContent = buildMdx(
        { title, excerpt, date, readTime, category, coverGradient, coverImage },
        content || ""
    );

    const res = await fetch(
        `${GITHUB_API}/repos/${gh.repo}/contents/${filePath}`,
        {
            method: "PUT",
            headers: headers(gh.token),
            body: JSON.stringify({
                message: `blog: update ${locale}/${slug}`,
                content: Buffer.from(mdxContent).toString("base64"),
                sha: fileSha,
                branch: gh.branch,
            }),
        }
    );

    if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err.message || "GitHub API error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// DELETE — Delete post from GitHub
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gh = getGitHubConfig();
    if (!gh) {
        return NextResponse.json({ error: "GitHub not configured" }, { status: 500 });
    }

    const { slug, locale } = await req.json();
    if (!slug || !locale) {
        return NextResponse.json({ error: "Missing slug or locale" }, { status: 400 });
    }

    const filePath = `src/content/blog/${locale}/${slug}.mdx`;

    // Get file SHA
    const getRes = await fetch(
        `${GITHUB_API}/repos/${gh.repo}/contents/${filePath}?ref=${gh.branch}`,
        { headers: headers(gh.token) }
    );
    if (!getRes.ok) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const fileData = await getRes.json();

    const res = await fetch(
        `${GITHUB_API}/repos/${gh.repo}/contents/${filePath}`,
        {
            method: "DELETE",
            headers: headers(gh.token),
            body: JSON.stringify({
                message: `blog: delete ${locale}/${slug}`,
                sha: fileData.sha,
                branch: gh.branch,
            }),
        }
    );

    if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err.message || "GitHub API error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
