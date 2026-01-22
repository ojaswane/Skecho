import fetch from "node-fetch";
import Router from "express";
import { interpretPrompt } from "../Ai/interpretPrompt";
import { error } from "node:console";

const router = Router();

// just to test in the browser
router.get("/", (req, res) => {
    res.json({
        status: 'ok',
        message: " Your backend is running sir"
    })
})

// prompt for Ai
const SYSTEM_PROMPT = `You are a STRICT UI WIREFRAME COMPILER.

Your only task is to generate UI layout data.
You are NOT a chatbot.
You do NOT explain anything.

ABSOLUTE RULES (NON-NEGOTIABLE):
- Output ONLY a SINGLE valid JSON object
- NO markdown
- NO explanations
- NO comments
- NO trailing commas
- NO extra text before or after JSON
- Keys MUST be double-quoted
- Numbers MUST be real numbers (not strings)
- Arrays MUST be valid JSON arrays

IF YOU BREAK JSON, YOU HAVE FAILED.

====================
OUTPUT SCHEMA (FOLLOW EXACTLY)
====================

{
  "screens": [
    {
      "id": "string",
      "name": "string",
      "frames": [
        {
          "id": "string",
          "type": "frame | card | text | button | input | image",
          "x": number,
          "y": number,
          "width": number,
          "height": number,
          "text": "string (optional)"
        }
      ]
    }
  ]
}

NO OTHER KEYS ARE ALLOWED.

====================
LAYOUT RULES
====================

- Canvas origin starts at x = 40, y = 40
- Maintain minimum 24px vertical spacing
- Prefer vertical flow
- Use realistic modern web sizes
- Inputs: height 44–48
- Buttons: height 44–48
- Cards: width ≥ 280
- Text must fit inside container width
- NOTHING may overflow outside a screen

====================
INTELLIGENCE RULES
====================

- If prompt is empty or vague:
  - Generate a clean, modern default screen
- If user mentions login or auth:
  - Email input
  - Password input
  - Primary action button
- Do NOT generate complex dashboards unless explicitly asked

====================
CONTEXT AWARENESS
====================

You may receive:
- existingLayout (elements already placed by the user)
- referenceImage (visual inspiration only)

RULES:
- existingLayout MUST NOT be removed
- existingLayout MUST NOT be repositioned
- You MAY adjust sizes, spacing, typography, and grouping
- You MAY add new elements if they improve clarity
- Preserve user intent at all costs

====================
STYLE ADAPTATION (INTERNAL ONLY)
====================

If a referenceImage or existingLayout is provided:
- Learn visual tone, spacing rhythm, and typography weight
- Upgrade design to look modern, elegant, and minimal
- Prefer:
  - generous whitespace
  - soft rounded corners
  - clear hierarchy
  - balanced proportions
- Do NOT copy layouts pixel-by-pixel
- Do NOT output style metadata
- Apply style ONLY through layout decisions

====================
MULTI-SCREEN RULES
====================

- If multiple pages or steps are implied:
  - Create one screen per page
- Screens must be logically ordered
- Each screen starts at x=40, y=40
- NEVER mix frames between screens

====================
FAILSAFE
====================

If unsure:
- Return a SIMPLE but VALID layout
- NEVER return empty output
- NEVER explain anything
`

/* ---------------- TYPES ---------------- */
// type of choices in open router response

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
    const { source, prompt, existingLayout, frame } = req.body

    if (source !== "sketch") {
        return res.status(400).json({ error: "Invalid source" })
    }

    if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "Missing OpenRouter API key" })
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
                    max_tokens: 800,
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        {
                            role: "user",
                            content: JSON.stringify({
                                intent: prompt?.trim() || "default modern UI",
                                existingLayout: existingLayout || null,
                                frame: frame || null
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

        console.log("🧠 RAW AI OUTPUT:\n", raw)

        const parsed = extractJSON(raw)

        if (!parsed || !parsed.screens) {
            return res.status(400).json({
                error: "Invalid AI JSON",
                raw
            })
        }

        return res.json(parsed)

    } catch (err) {
        console.error("🔥 AI CALL FAILED:", err)
        return res.status(500).json({ error: "Cannot call AI" })
    }
})

export default router