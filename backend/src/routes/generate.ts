import fetch from "node-fetch"
import Router from "express"
import { WireframeSchema } from "../../validation/wireframe.schema"

const router = Router()

/* ---------------- TEST ---------------- */

router.get("/", (_, res) => {
    res.json({
        status: "ok",
        message: "Backend running"
    })
})

/* ---------------- SYSTEM PROMPT ---------------- */

const SYSTEM_PROMPT = `
You are a STRICT UI WIREFRAME COMPILER.

You generate STRUCTURED LAYOUT DATA.
You NEVER think in pixels.

You output ONLY valid JSON.

ABSOLUTE RULES:
- JSON only
- No explanations
- No markdown
- No comments

LAYOUT RULES:
- Grid only
- Bento layouts must be asymmetrical
- Never output x, y, width, height
- Use grid.colStart, colSpan, rowStart, rowSpan
- Think like a magazine layout designer


You are NOT a chatbot.
You NEVER explain.
You Never add comments
You output ONLY valid JSON.
- NEVER invent random UI



EXAMPLE OUTPUT SCHEMA:
{
  "meta": { "device": "desktop" },
  "frames": [
    {
      "id": "frame-root",
      "type": "frame",
      "gridSystem": {
        "columns": 12,
        "margin": 32,
        "gutter": 32,
        "rowHeight": 96,
        "type": "stretch"
      },
      "children": [
        {
          "id": "brand",
          "type": "card",
          "grid": { "col": 4, "row": 1, "colSpan": 5, "rowSpan": 3 }
        },
        {
          "id": "left",
          "type": "card",
          "grid": { "col": 1, "row": 1, "colSpan": 3, "rowSpan": 4 }
        },
        {
          "id": "right-top",
          "type": "card",
          "grid": { "col": 9, "row": 1, "colSpan": 4, "rowSpan": 2 }
        },
        {
          "id": "right-bottom",
          "type": "card",
          "grid": { "col": 9, "row": 3, "colSpan": 4, "rowSpan": 2 }
        }
      ]
    }
  ]
}

`

/* ---------------- TYPES ---------------- */

type OpenRouterResponse = {
    choices: {
        message: {
            content: string
        }
    }[]
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

/* ---------------- MAIN ROUTE ---------------- */

router.post("/", async (req, res) => {
    const { source, prompt, existingLayout } = req.body

    if (source !== "sketch") {
        return res.status(400).json({ error: "Invalid source" })
    }

    if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "Missing API key" })
    }

    try {
        const aiResponse = await fetch(
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
                        { role: "system", content: SYSTEM_PROMPT },
                        {
                            role: "user",
                            content: JSON.stringify({
                                intent: prompt?.trim() || "modern bento dashboard",
                                existingLayout
                            })
                        }
                    ]
                })
            }
        )

        const data = (await aiResponse.json()) as OpenRouterResponse
        const raw = data?.choices?.[0]?.message?.content

        if (!raw) {
            return res.status(400).json({ error: "Empty AI response" })
        }

        console.log("RAW AI OUTPUT:\n", raw)

        const parsed = extractJSON(raw)

        if (!parsed || !parsed.screens) {
            return res.status(400).json({
                error: "Invalid AI JSON",
                raw
            })
        }

        /* ---------------- ZOD VALIDATION ---------------- */

        const validation = WireframeSchema.safeParse(parsed)

        if (!validation.success) {
            console.error(
                "ZOD VALIDATION FAILED",
                validation.error.format()
            )

            return res.status(400).json({
                error: "AI output failed validation",
                details: validation.error.format()
            })
        }


        return res.json({
            screens: validation.data.screens
        })

    } catch (err) {
        console.error("AI CALL FAILED:", err)
        return res.status(500).json({ error: "AI call failed" })
    }
})

export default router