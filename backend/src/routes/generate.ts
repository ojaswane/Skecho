import fetch from "node-fetch";
import Router from "express";
import { WireframeSchema } from "../../validation/wireframe.schema";

const router = Router();

// just to test in the browser
router.get("/", (req, res) => {
    res.json({
        status: 'ok',
        message: " Your backend is running sir"
    })
})

// prompt for Ai
const SYSTEM_PROMPT = `
You are a STRICT UI WIREFRAME COMPILER.

You generate STRUCTURED LAYOUT DATA.
You do NOT think in pixels unless explicitly required.

You are NOT a chatbot.
You NEVER explain.
You output ONLY valid JSON.

====================
ABSOLUTE RULES
====================
- Output ONLY a SINGLE valid JSON object
- NO markdown
- NO comments
- NO explanations
- NO trailing commas
- Keys MUST be double-quoted
- Numbers MUST be real numbers
- Arrays MUST be valid JSON arrays
- If JSON is invalid → you have FAILED

====================
OUTPUT SCHEMA (STRICT)
====================

{
  "screens": [
    {
      "id": "string",
      "name": "string",
      "layout": {
        "type": "bento | stack",
        "columns": number,
        "gap": number,
        "padding": number
      },
      "frames": [
        {
          "id": "string",
          "type": "frame | card | text | button | input | image",
          "grid": {
            "colStart": number,
            "colSpan": number,
            "rowStart": number,
            "rowSpan": number
          },
          "text": "string (optional)"
        }
      ]
    }
  ]
}

NO OTHER KEYS ARE ALLOWED.

====================
LAYOUT INTELLIGENCE RULES
====================

- Use GRID, not absolute positioning
- Prefer asymmetry
- Large image cards span 3–5 columns
- Brand/hero spans more rows than others
- Avoid empty gaps
- Cards must align to grid
- Never output x/y/width/height
- Think like a magazine layout editor
- Default canvas width: 1440
- Bento layouts MUST be asymmetrical
- Primary sections must be wider
- Avoid equal column spans unless necessary
- Maintain generous whitespace
- Do NOT overcrowd

====================
COMPONENT RULES
====================

- Input height: 44–48
- Button height: 44–48
- Cards must have padding
- Text must never overflow
- Images must be square or circular

====================
CONTEXT AWARENESS
====================

You may receive:
- existingLayout
- referenceImage

RULES:
- existingLayout MUST NOT be removed
- existingLayout MUST NOT be repositioned
- You MAY add new elements
- Preserve user intent at all costs

====================
FAILSAFE
====================

If unsure:
- Generate a SIMPLE but VALID layout
- NEVER return empty output
- NEVER invent random UI
`;


function clampFrames(
    frames: any[],
    maxWidth = 1440,
    maxHeight = 1024
) {
    return frames.map((f) => ({
        ...f,
        x: Math.max(40, Math.min(f.x, maxWidth - f.width - 40)),
        y: Math.max(40, Math.min(f.y, maxHeight - f.height - 40)),
    }));
}

function resolveGridToPixels(
    frames: any[],
    layout: { columns: number; gap: number; padding: number },
    canvasWidth = 1440
) {
    const columnWidth =
        (canvasWidth -
            layout.padding * 2 -
            layout.gap * (layout.columns - 1)) /
        layout.columns;

    return frames.map((f) => {
        if (!f.grid) return f;

        const x =
            layout.padding +
            (f.grid.colStart - 1) * (columnWidth + layout.gap);

        const y =
            layout.padding +
            (f.grid.rowStart - 1) * 96; // row height baseline

        const width =
            f.grid.colSpan * columnWidth +
            (f.grid.colSpan - 1) * layout.gap;

        const height = f.grid.rowSpan * 96;

        return {
            ...f,
            x,
            y,
            width,
            height
        };
    });
}


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
                                existingLayout: existingLayout,
                                frame: frame
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

        console.log(" RAW AI OUTPUT:\n", raw)

        const parsed = extractJSON(raw)

        if (!parsed || !parsed.screens) {
            return res.status(400).json({
                error: "Invalid AI JSON",
                raw
            })
        }

        // ZOD validation
        const validation = WireframeSchema.safeParse(parsed);

        if (!validation.success) {
            console.error("ZOD VALIDATION FAILED", validation.error.format());
            return res.status(400).json({
                error: "AI output failed validation",
                details: validation.error.format()
            });
        }

        const safeData = validation.data;

        safeData.screens.forEach((screen) => {
            if (screen.layout) {
                screen.frames = resolveGridToPixels(
                    screen.frames,
                    screen.layout,
                    frame?.width ?? 1440
                );
            }

            screen.frames = clampFrames(
                screen.frames,
                frame?.width ?? 1440,
                frame?.height ?? 1024
            );
        });


        return res.json({
            screens: safeData.screens
        })

    } catch (err) {
        console.error("AI CALL FAILED:", err)
        return res.status(500).json({ error: "Cannot call AI" })
    }
})

export default router