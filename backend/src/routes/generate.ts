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
`

const SYSTEM_PROMPT_2 = `
You are a UI WIREFRAME LAYOUT COMPILER.

Convert SECTIONS into GRID-BASED FRAMES.

ABSOLUTE RULES:
- Output ONLY valid JSON
- Root key MUST be "screens"
- Use ONLY grid placement (colStart, colSpan, rowStart, rowSpan)
- Desktop grid = 12 columns
- Frames MUST be flat

DESIGN RULES:
- Bento = 1 dominant + 2–4 secondary
- Dominant spans 5–7 columns
- Secondary spans 2–4 columns
- Vary rowSpan
- Leave negative space
- Avoid symmetry

EVERY screen MUST include:
- id (string)
- name (string)
- frames (array)

Before outputting final JSON:
- Check visual balance
- Check dominance hierarchy
- Ensure one focal element exists
- Ensure breathing space
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

/* ---------------- ROUTE ------------------- */

router.post("/", async (req, res) => {
    const { source, prompt } = req.body

    if (source !== "sketch") {
        return res.status(400).json({ error: "Invalid source" })
    }

    try {
        /* -------- PASS 1 ,  DESIGN THINKING =-------- */

        const design = await callAI(SYSTEM_PROMPT_1, {
            productIntent: prompt || "modern SaaS dashboard"
        })

        if (!design?.sections?.length) {
            return res.status(400).json({
                error: "Failed to generate sections",
                design
            })
        }
       /* -------- PASS 2 ,  LAYOUT -------- */

        const layout = await callAI(SYSTEM_PROMPT_2, {
            sections: design.sections
        })

        if (!layout?.screens) {
            return res.status(400).json({
                error: "Invalid layout output",
                layout
            })
        }

        /* -------- FIX ID'S -------- */

        layout.screens = layout.screens.map((s, i) => ({
            id: s.id || `screen-${i + 1}`,
            name: s.name || `Screen ${i + 1}`,
            layout: s.layout,
            frames: s.frames
        }))

        /* -------- VALIDATION -------- */

        const validation = WireframeSchema.safeParse(layout)

        if (!validation.success) {
            return res.status(400).json({
                error: "AI output failed validation",
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
