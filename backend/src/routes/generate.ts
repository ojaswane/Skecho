import Router from "express"
import DENSITY_MAP from "../constants/densityMap/density_map.js"
import { GoogleGenerativeAI } from "@google/generative-ai"

const router = Router()

/* ---------------- SYSTEM PROMPT ---------------- */
const SYSTEM_PROMPT = `
You are a SENIOR PRODUCT DESIGNER specialized in SaaS aesthetics.
You will receive a user's prompt and an image of their hand-drawn sketch.

TASK:
1. REFINEMENT: Interpret the sketch. If the user drew a circle at the top, it's a "dominant" logo or profile. Boxes are "frames".
2. STRUCTURE: Return a JSON structure representing the refined version of that sketch plus two expansion screens.

RULES:
- Maximize white space (airy density)
- Keep output as strict JSON only
- Root key must be "screens"
- No explaination
`

/* ----------------- LAYOUT UTILS ---------------*/
type DensityLevel = "airy" | "normal" | "compact"

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

          if (span > 8) {
            currentRow += rowSpan + densityConfig.rowGap
          }

          return placed
        }),
      }
    }),
  }
}

function normalizeForCanvas(layout: any) {
  layout.screens = layout.screens.map((s: any, si: number) => ({
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
  }))
  return layout
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

async function callGemini(
  systemPrompt: string,
  payload: { imageBase64?: string; prompt?: string }
) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment variables.")

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: systemPrompt,
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

/* ---------------- ROUTE ------------------- */
router.post("/", async (req, res) => {
  const { prompt, imageBase64, density = "airy" } = req.body as {
    prompt?: string
    imageBase64?: string
    density?: DensityLevel
  }

  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  try {
    const rawText = await callGemini(SYSTEM_PROMPT, {
      prompt: prompt || "Design this SaaS page",
      imageBase64,
    })

    const design = parseGeminiJson(rawText)
    if (!design?.screens) throw new Error("AI_INVALID_FORMAT")

    res.write(
      `data: ${JSON.stringify({
        type: "PLAN",
        screens: design.screens.map((s: any) => s.name),
      })}\n\n`
    )

    for (const screen of design.screens) {
      const withLayout = applyLayout({ screens: [screen] }, density)
      const finalData = normalizeForCanvas(withLayout).screens[0]
      res.write(`data: ${JSON.stringify({ type: "SCREEN_DONE", data: finalData })}\n\n`)
    }

    res.write("data: [DONE]\n\n")
    res.end()
  } catch (err: any) {
    res.write(
      `data: ${JSON.stringify({
        error: "PIPELINE_ERROR",
        message: err?.message || "Unknown pipeline error",
      })}\n\n`
    )
    res.end()
  }
})

export default router