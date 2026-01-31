import fetch from "node-fetch"
import Router from "express"
import { WireframeSchema } from "../../validation/wireframe.schema"

const router = Router()

/* ---------------- TEST ---------------- */

router.get("/", (_, res) => {
    res.json({ status: "ok", message: "Backend running" })
})

/* ---------------- SYSTEM PROMPTS ---------------- */

const SYSTEM_PROMPT_1 = `
You are a SENIOR PRODUCT DESIGNER.

You decide:
- Page sections
- Visual hierarchy
- Layout styles

Rules:
- Do NOT think in components
- Do NOT think in grids
- Do NOT think in pixels

Output ONLY JSON.

Schema:
{
  "sections": [
    {
      "id": string,
      "intent": string,
      "visualWeight": "dominant" | "medium" | "light",
      "layoutStyle": "bento" | "stack" | "editorial" | "centered"
    }
  ]
}

NOTE: ALL THE ID MUST BE UNIQUE 
IF ITS LIKE:
{
    id : feature
}

THEN MAKE IT LIKE
{
    id: feature-1
}

`



/* ---------------- TYPES ---------------- */

type OpenRouterResponse = {
    choices: { message: { content: string } }[]
}

/* ---------------- UTILS ---------------- */

function extractJSON(text: string) {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
        return JSON.parse(match[0])
    } catch {
        return null
    }
}

async function callAI(system: string, payload: any) {
    const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                temperature: 0.2,
                max_tokens: 900,
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: JSON.stringify(payload) }
                ]
            })
        }
    )

    const data = (await res.json()) as OpenRouterResponse
    return extractJSON(data?.choices?.[0]?.message?.content || "")
}


function normalizeForCanvas(layout: any) {
    layout.screens = layout.screens.map((s, si) => ({
        id: s.id || `screen-${si + 1}`,
        name: s.name || `Screen ${si + 1}`,

        frames: (s.frames || []).map((f, fi) => {
            const col =
                f.col ??
                f.colStart ??
                1

            const row =
                f.row ??
                f.rowStart ??
                1

            const span =
                f.span ??
                f.colSpan ??
                12

            const rowSpan =
                f.rowSpan ??
                1

            return {
                id: f.id || `frame-${si}-${fi}`,
                type: f.type || "card",
                role: f.role,
                text: f.text,

                col,
                row,
                span,
                rowSpan,
            }
        }),
    }))

    console.log("PRE-ZOD:", JSON.stringify(layout, null, 2))
    return layout
}



/* ---------------- ROUTE ------------------- */

router.post("/", async (req, res) => {
    const { source, prompt } = req.body

    if (source !== "sketch") {
        return res.status(400).json({ error: "Invalid source" })
    }

    try {
        /* -------- PASS 1: DESIGN THINKING -------- */

        const design = await callAI(SYSTEM_PROMPT_1, {
            productIntent: prompt || "modern SaaS dashboard"
        })

        if (!design?.sections?.length) {
            return res.status(400).json({
                error: "Failed to generate sections",
                design
            })
        }

        /* -------- FIX id's -------- */

        refined.screens = refined.screens.map((s, i) => ({
            id: s.id || `screen-${i + 1}`,
            name: s.name || `Screen ${i + 1}`,
            layout: s.layout,
            frames: s.frames
        }))

        /* -------- NORMALIZE FOR CANVAS -------- */

        const normalized = normalizeForCanvas(refined)

        /* -------- VALIDATION(zod) -------- */

        const validation = WireframeSchema.safeParse(normalized)

        if (!validation.success) {
            return res.status(400).json({
                error: "Final layout failed validation",
                details: validation.error.format()
            })
        }

        return res.json(validation.data)

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "AI pipeline failed" })
    }
})


export default router