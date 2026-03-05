import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { audioUrl, geminiKey, model } = await req.json();

        if (!audioUrl || !geminiKey) {
            return NextResponse.json({ error: "audioUrl and geminiKey are required" }, { status: 400 });
        }

        // Fetch audio file for Gemini
        const audioRes = await fetch(audioUrl);
        if (!audioRes.ok) {
            return NextResponse.json({ error: "Failed to fetch audio file" }, { status: 400 });
        }

        const audioBytes = await audioRes.arrayBuffer();
        const base64Audio = Buffer.from(audioBytes).toString("base64");

        // Determine MIME type from URL
        const mimeType = audioUrl.endsWith(".wav") ? "audio/wav"
            : audioUrl.endsWith(".ogg") ? "audio/ogg"
            : "audio/mpeg";

        const prompt = `Analyze this sound effect audio and return a JSON object with exactly these fields:
{
  "category": one of: "weapon", "weather", "nature", "ui", "ambient", "impact", "voice", "music", "vehicle", "animal", "technology", "other",
  "subcategory": specific type within category (e.g., "sword", "rain", "click"),
  "mood": one of: "dramatic", "calm", "tense", "happy", "sad", "mysterious", "energetic", "peaceful",
  "intensity": one of: "low", "medium", "high",
  "tags": array of 10-15 descriptive keywords in English AND Vietnamese (e.g., ["sword", "slash", "metal", "kiếm", "chém"]),
  "description": a detailed 2-3 sentence description covering what the sound is, what it sounds like, and alternative names in Vietnamese. Example: "A sharp metallic sword slash cutting through air with a quick whooshing trail. Sounds like a katana or blade strike. Tiếng kiếm chém, tiếng dao cắt gió.",
  "use_cases": a comma-separated string of 5-8 scenarios where this sound would be used. Include both English and Vietnamese. Example: "action movie fight scene, anime battle, video game combat, phim hành động, cảnh chiến đấu, TikTok edit"
}
Return ONLY the JSON object, no markdown, no explanation.`;

        const geminiModel = model || "gemini-2.5-flash";
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64Audio,
                                },
                            },
                            { text: prompt },
                        ],
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 800,
                        responseMimeType: "application/json",
                    },
                }),
            }
        );

        if (!geminiRes.ok) {
            const errData = await geminiRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errData.error?.message || "Gemini API failed" },
                { status: geminiRes.status }
            );
        }

        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Strip markdown code fences if present
        const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

        // Parse JSON from response
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("[Analyze] Raw Gemini response:", text);
            return NextResponse.json({ error: "Failed to parse Gemini response", raw: text.substring(0, 500) }, { status: 500 });
        }

        let analysis;
        try {
            analysis = JSON.parse(jsonMatch[0]);
        } catch (parseErr) {
            console.error("[Analyze] JSON parse error:", parseErr, "Raw:", jsonMatch[0].substring(0, 500));
            return NextResponse.json({ error: "Invalid JSON from Gemini", raw: text.substring(0, 500) }, { status: 500 });
        }

        // Ensure tags is a JSON string
        if (Array.isArray(analysis.tags)) {
            analysis.tags = JSON.stringify(analysis.tags);
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("SFX analyze error:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}

