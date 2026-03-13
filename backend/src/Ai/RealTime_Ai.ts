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
- Keep output strict JSON only
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

function parseGeminiJson(text: string) {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
        const cleanJson = match[0].replace(/```json/g, "").replace(/```/g, "")
        return JSON.parse(cleanJson)
    } catch {
        return null
    }
}

async function callGeminiFlash(payload: { prompt?: string; imageBase64?: string }) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment variables.")

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
        },
    })

    const userParts: any[] = []
    if (payload.prompt) userParts.push({ text: payload.prompt })
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
    const raw = await callGeminiFlash({
        prompt: prompt || "Design this SaaS page",
        imageBase64,
    })

    const parsed = parseGeminiJson(raw)
    if (!parsed?.screens) {
        throw new Error("AI_INVALID_FORMAT")
    }

    const normalizedScreens = parsed.screens.map((screen: any) => {
        const withLayout = applyLayout({ screens: [screen] }, density)
        return normalizeForCanvas(withLayout).screens[0]
    })

    return normalizedScreens
}
