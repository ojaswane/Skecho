import fetch from "node-fetch"
import Router from "express"
import { WireframeSchema } from "../../validation/wireframe.schema"

const router = Router()

/* ---------------- TEST ---------------- */

router.get("/", (_, res) => {
    res.json({ status: "ok", message: "Backend running" })
})

/* ---------------- SYSTEM PROMPT ---------------- */
const SYSTEM_PROMPT_1 = `
You are a SENIOR WIREFRAME PLANNER.

Your job:
- Decide what content exists on the screen
- Decide hierarchy (dominant | supporting | decorative)

STRICT RULES:
- Do NOT describe visuals
- Do NOT mention colors, radius, grids, columns, rows, pixels
- Do NOT invent new block types

You may ONLY use these semantic blocks:
- profile_image
- content_image
- title_text
- body_text
- meta_text
- primary_action

Output ONLY valid JSON.

Schema:
{
  "screens": [
    {
      "id": string,
      "name": string,
      "frames": [
        {
          "id": string,
          "role": "dominant" | "supporting" | "decorative",
          "blocks": [
            { "semantic": string }
          ]
        }
      ]
    }
  ]
}

ALL ids must be unique.
`

/* ----------------- FUNCTIONS ---------------*/
function applyLayout(design: any) {
    return {
        screens: design.screens.map((screen) => {
            let currentRow = 1

            return {
                ...screen,
                frames: screen.frames.map((frame) => {
                    const isDominant = frame.role === "dominant"

                    const placedFrame = {
                        ...frame,
                        col: isDominant ? 2 : 2,
                        span: isDominant ? 8 : 4,
                        row: currentRow,
                        rowSpan: isDominant ? 3 : 2,
                        type: "card"
                    }

                    currentRow += placedFrame.rowSpan + 1

                    return placedFrame
                })
            }
        })
    }
}



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
        const design = await callAI(SYSTEM_PROMPT_1, {
            productIntent: prompt || "modern SaaS dashboard"
        })

        if (!design?.screens) {
            return res.status(400).json({ error: "Semantic generation failed" })
        }

        const withLayout = applyLayout(design)

        /* -------- NORMALIZE FOR CANVAS -------- */
        const normalized = normalizeForCanvas(withLayout)


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