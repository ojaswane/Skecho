import DENSITY_MAP from "../constants/densityMap/density_map.js"
import { GoogleGenerativeAI } from "@google/generative-ai"

type DensityLevel = "airy" | "normal" | "compact"
type SketchSummary = {
    counts?: {
        total?: number
        paths?: number
        rects?: number
        circles?: number
        texts?: number
        images?: number
        other?: number
    }
    hint?: string
}

const SYSTEM_PROMPT = `
You are a SENIOR PRODUCT DESIGNER specialized in SaaS aesthetics.
You will receive a user's prompt and optionally a rough sketch signal.

TASK:
1. Interpret the intent quickly.
2. Return strict JSON with root key "screens".
3. Each screen MUST include a non-empty "frames" array.
4. Each frame MUST include: id, role, span. (You may include col,row,rowSpan,type,text too.)

RULES:
- Keep output strict JSON only (no markdown, no commentary)
- Prefer clean airy spacing
- No explanations
- Always return at least 1 screen
- Always return at least 5 frames per screen

EXPECTED OUTPUT:
{
  "screens": [
    {
      "id": "screen-1",
      "name": "Screen 1",
      "frames": [
        { "id": "hero", "role": "dominant", "span": 12, "type": "card" },
        { "id": "a", "role": "supporting", "span": 6, "type": "card" },
        { "id": "b", "role": "supporting", "span": 6, "type": "card" },
        { "id": "c", "role": "supporting", "span": 4, "type": "card" },
        { "id": "d", "role": "supporting", "span": 4, "type": "card" }
      ]
    }
  ]
}
`

function fallbackFrames() {
    return [
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
        {
            id: "features-a",
            role: "supporting",
            span: 6,
            type: "card"
        },
        {
            id: "features-b",
            role: "supporting",
            span: 6,
            type: "card"
        },
        {
            id: "proof",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "pricing",
            role: "supporting",
            span: 4,
            type: "card"
        },

        {
            id: "cta",
            role: "supporting",
            span: 4,
            type: "card"
        },
    ]
}

function heroOnlyFrames() {
    return [
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
        {
            id: "hero-media",
            role: "supporting",
            span: 12,
            type: "card"
        },
    ]
}

function featureGridFrames() {
    return [
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
        {
            id: "feature-1",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "feature-2",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "feature-3",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "cta",
            role: "supporting",
            span: 12,
            type: "card"
        },
    ]
}

function applyLayout(design: any, density: DensityLevel = "normal") {
    const densityConfig = DENSITY_MAP[density]
    const TOTAL_COLUMNS = 12

    return {
        ...design,
        screens: design.screens.map((screen: any) => {
            let currentRow = 1
            return {
                ...screen,
                frames: (screen.frames || []).map((frame: any) => {
                    const isDominant = frame.role === "dominant"
                    const span = frame.span || (isDominant ? 12 : 6)
                    const col =
                        frame.col || (span === 12 ? 1 : Math.floor((12 - span) / 2) + 1)
                    const rowSpan = isDominant
                        ? densityConfig.dominantRowSpan
                        : densityConfig.supportingRowSpan

                    const placed = {
                        ...frame,
                        col: Math.floor(col),
                        span: Math.min(span, TOTAL_COLUMNS),
                        row: currentRow,
                        rowSpan,
                        type: "card",
                    }

                    if (span > 8) currentRow += rowSpan + densityConfig.rowGap
                    return placed
                }),
            }
        }),
    }
}

function normalizeForCanvas(layout: any) {
    return {
        ...layout,
        screens: (layout.screens || []).map((s: any, si: number) => ({
            id: s.id || `screen-${si + 1}`,
            name: s.name || `Screen ${si + 1}`,
            frames: (s.frames || []).map((f: any, fi: number) => ({
                id: f.id || `frame-${si}-${fi}`,
                type: f.type || "card",
                role: f.role,
                text: f.text,
                col: f.col ?? f.colStart ?? 1,
                row: f.row ?? f.rowStart ?? 1,
                span: f.span ?? f.colSpan ?? 12,
                rowSpan: f.rowSpan ?? 1,
            })),
        })),
    }
}

function parseGeminiJson(rawText: string) {
    if (!rawText) return null

    const trimmed = rawText.trim()

    // 1) Try direct JSON first (responseMimeType often yields pure JSON).
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
            return JSON.parse(trimmed)
        } catch {
            // fall through
        }
    }

    // 2) Strip fenced blocks, then retry.
    const unfenced = trimmed.replace(/```json/gi, "").replace(/```/g, "").trim()
    if (unfenced.startsWith("{") || unfenced.startsWith("[")) {
        try {
            return JSON.parse(unfenced)
        } catch {
            // fall through
        }
    }

    // 3) Last resort: extract a JSON object/array substring.
    const objMatch = unfenced.match(/\{[\s\S]*\}/)
    if (objMatch?.[0]) {
        try {
            return JSON.parse(objMatch[0])
        } catch {
            // fall through
        }
    }
    const arrMatch = unfenced.match(/\[[\s\S]*\]/)
    if (arrMatch?.[0]) {
        try {
            return JSON.parse(arrMatch[0])
        } catch {
            // fall through
        }
    }

    return null
}

function coerceScreens(parsed: any): any[] | null {
    if (!parsed) return null
    if (Array.isArray(parsed)) return parsed
    if (Array.isArray(parsed.screens)) return parsed.screens
    if (Array.isArray(parsed.Screens)) return parsed.Screens
    if (Array.isArray(parsed.data?.screens)) return parsed.data.screens
    // Common alternative shapes: a single object with `frames` or a doc-like object with `sections`.
    if (Array.isArray(parsed.frames)) {
        return [
            {
                id: parsed.id ?? "screen-1",
                name: parsed.name ?? "Screen 1",
                frames: parsed.frames,
            },
        ]
    }
    if (Array.isArray(parsed.sections)) {
        const frames = parsed.sections.map((s: any, i: number) => ({
            id: s.id ?? `section-${i + 1}`,
            role: s.role ?? "supporting",
            col: s.layout?.col ?? s.layout?.colStart,
            row: s.layout?.row ?? s.layout?.rowStart,
            span: s.layout?.span ?? s.layout?.colSpan ?? 12,
            rowSpan: s.layout?.rowSpan ?? 1,
            type: "card",
            text: s.name ?? s.title,
        }))
        return [
            {
                id: parsed.id ?? "screen-1",
                name: parsed.name ?? "Screen 1",
                frames,
            },
        ]
    }
    return null
}

async function callGeminiFlash(payload: { prompt?: string; imageBase64?: string; strict?: boolean }) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment variables.")

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: payload.strict ? 0 : 0.2,
        },
    })

    const userParts: any[] = []
    const basePrompt = payload.prompt?.trim() || "Design this SaaS page"
    const strictSuffix = payload.strict
        ? "\nReturn ONLY valid JSON with root key \"screens\". No markdown, no commentary."
        : ""
    userParts.push({ text: `${basePrompt}${strictSuffix}` })


    // This piece of code is to conver the image into the mimeType
    if (payload.imageBase64) {
        const [prefix, rest] = payload.imageBase64.split(",", 2)
        const rawData = rest || payload.imageBase64
        const mimeType =
            prefix?.includes("image/jpeg") ? "image/jpeg" :
                prefix?.includes("image/jpg") ? "image/jpeg" :
                    prefix?.includes("image/webp") ? "image/webp" :
                        "image/png"
        userParts.push({
            inlineData: {
                mimeType,
                data: rawData,
            },
        })
    }

    const result = await model.generateContent({
        contents: [{ role: "user", parts: userParts }],
    })

    let text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || ""
    if (!text) {
        const fallback = result.response.text
        text = typeof fallback === "function" ? fallback() : fallback || ""
    }
    return text
}

export async function GenerateRealTimeAi({
    prompt,
    imageBase64,
    density = "airy",
    sketchSummary,
}: {
    prompt?: string
    imageBase64?: string
    density?: DensityLevel
    sketchSummary?: SketchSummary
}) {
    const total = sketchSummary?.counts?.total ?? 0
    const rects = sketchSummary?.counts?.rects ?? 0
    const hint = String(sketchSummary?.hint ?? "").toLowerCase()

    // Template shortcut: for tiny sketches, return a small, stable layout instead of a full page.
    // This makes "one line" or "few strokes" feel intentional and avoids random big layouts.
    if (sketchSummary && total > 0 && total < 5) {
        const screen = { id: "screen-1", name: "Screen 1", frames: heroOnlyFrames() }
        const withLayout = applyLayout({ screens: [screen] }, density)
        return [normalizeForCanvas(withLayout).screens[0]]
    }

    // If the user sketched multiple boxes (rects), prefer a grid-ish landing section template.
    if (sketchSummary && (rects >= 3 || hint === "grid")) {
        const screen = { id: "screen-1", name: "Screen 1", frames: featureGridFrames() }
        const withLayout = applyLayout({ screens: [screen] }, density)
        return [normalizeForCanvas(withLayout).screens[0]]
    }

    const basePrompt = prompt || "Design this SaaS page"
    const summarySuffix = sketchSummary
        ? `\nSketch summary (use to decide layout size): total=${total}, rects=${rects}, hint=${hint || "none"}.`
        : ""

    const raw1 = await callGeminiFlash({
        prompt: `${basePrompt}${summarySuffix}`,
        imageBase64,
    })

    let parsed = parseGeminiJson(raw1)
    let screens = coerceScreens(parsed)

    // One retry with a stricter prompt + temperature=0 if the first response isn't usable.
    if (!screens?.length) {
        const raw2 = await callGeminiFlash({
            prompt: `${basePrompt}${summarySuffix}`,
            imageBase64,
            strict: true,
        })
        parsed = parseGeminiJson(raw2)
        screens = coerceScreens(parsed)
    }

    if (!screens?.length) {
        console.log("[ai] AI_INVALID_FORMAT snippet:", String(raw1 || "").slice(0, 400))
        throw new Error("AI_INVALID_FORMAT")
    }

    const normalizedScreens = screens.map((screen: any, i: number) => {
        const safeScreen = {
            id: screen?.id ?? `screen-${i + 1}`,
            name: screen?.name ?? `Screen ${i + 1}`,
            ...screen,
            frames:
                Array.isArray(screen?.frames) && screen.frames.length
                    ? screen.frames
                    : fallbackFrames(),
        }

        const withLayout = applyLayout({ screens: [safeScreen] }, density)
        return normalizeForCanvas(withLayout).screens[0]
    })

    return normalizedScreens
}
