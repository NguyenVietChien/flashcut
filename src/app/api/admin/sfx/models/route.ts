import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { geminiKey } = await req.json();
        if (!geminiKey) {
            return NextResponse.json({ error: "API key required" }, { status: 400 });
        }

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: err.error?.message || "Failed to list models" },
                { status: res.status }
            );
        }

        const data = await res.json();

        // Filter to only generative models that support generateContent
        const models = (data.models || [])
            .filter((m: any) =>
                m.supportedGenerationMethods?.includes("generateContent") &&
                m.name?.startsWith("models/gemini")
            )
            .map((m: any) => ({
                id: m.name.replace("models/", ""),
                name: m.displayName || m.name.replace("models/", ""),
                description: m.description?.slice(0, 80) || "",
            }))
            .sort((a: any, b: any) => a.id.localeCompare(b.id));

        return NextResponse.json({ models });
    } catch (error) {
        console.error("List models error:", error);
        return NextResponse.json({ error: "Failed to list models" }, { status: 500 });
    }
}
