import DENSITY_MAP from "../constants/densityMap/density_map.js"
import { GoogleGenerativeAI } from "@google/generative-ai"

type DensityLevel = "airy" | "normal" | "compact"

const SYSTEM_PROMPT = `
You are a SENIOR PRODUCT DESIGNER specialized in SaaS aesthetics.
You will receive a user's prompt and optionally a rough sketch signal.

TASK:
1. Interpret the intent quickly.
2. Return JSON with root key "screens".
3. Each screen has "frames" with fields: role, col, row, span, rowSpan, type.

RULES:
- Keep output strict JSON only (no markdown, no commentary)
- Prefer clean airy spacing
- No explanations

EXPECTED OUTPUT:
{
  "frameId": "FRAME_ID",
  "style": "Minimal", // this is the default style guide
  "density": "airy",
  "sections": [
    {
      "id": "section_1",
      "role": "hero",
      "layout": { "col": 1, "row": 1, "span": 12, "rowSpan": 4 },
      "elements": [
        { "id": "el_1", "type": "title", "content": "Explore collections" },
        { "id": "el_2", "type": "search" },
        { "id": "el_3", "type": "card", "content": "Featured" },
        { "id": "el_4", "type": "button", "content": "See all" }
      ]
    }
  ]
}

`

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
    if (payload.imageBase64) {
        const rawData = payload.imageBase64.split(",")[1] || payload.imageBase64
        userParts.push({
            inlineData: {
                mimeType: "image/png",
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
}: {
    prompt?: string
    imageBase64?: string
    density?: DensityLevel
}) {
    const raw1 = await callGeminiFlash({
        prompt: prompt || "Design this SaaS page",
        imageBase64,
    })

    let parsed = parseGeminiJson(raw1)
    let screens = coerceScreens(parsed)

    // One retry with a stricter prompt + temperature=0 if the first response isn't usable.
    if (!screens?.length) {
        const raw2 = await callGeminiFlash({
            prompt: prompt || "Design this SaaS page",
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

    const normalizedScreens = screens.map((screen: any) => {
        const withLayout = applyLayout({ screens: [screen] }, density)
        return normalizeForCanvas(withLayout).screens[0]
    })

    return normalizedScreens
}
