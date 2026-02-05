import fetch from "node-fetch"
import Router from "express"
import { WireframeSchema } from "../../validation/wireframe.schema"
import DENSITY_MAP from "../design-systems/densityMap/density_map"

const router = Router()

/* ---------------- TEST ---------------- */

router.get("/", (_, res) => {
    res.json({ status: "ok", message: "Backend running" })
})

/* ---------------- SYSTEM PROMPT ---------------- */
const SYSTEM_PROMPT_1 = `
You are a SENIOR WIREFRAME PLANNER.

Each screen MUST include a layoutPattern.

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

Allowed layoutPattern values:
- hero
- feed
- grid
- settings
- auth
- marketing

Schema:
{
  "screens": [
    {
      "id": string,
      "name": string,
      "layoutPattern": "hero | feed | grid | settings | auth | marketing",
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

const DESIGN_CONSTITUTION = `
NON - NEGOTIABLE DESIGN LAWS:
1. THE 60 - 30 - 10 RULE: Use white space aggressively. 
2. NO STACKING: Supporting frames should be side - by - side(Horizontal) unless on Mobile.
3. OFFSET: Dominant frames should never be perfectly centered; offset them to create visual interest.
4. TYPE HIERARCHY: Title_text must always be at least 2x the size of body_text.

REFINEMENT TASKS:
- If layoutPattern is 'hero', ensure the 'dominant' frame spans at least 8 columns.
- Ensure 'supporting' frames have a rowGap of exactly 2.
    
`
const SYSTEM_PROMPT_2 = `
You are a DESIGN LAW ENFORCER.

You will receive an EXISTING wireframe layout.

${DESIGN_CONSTITUTION}

Rules:
- You MUST preserve screens and frames
- You MAY ONLY adjust:
  - col
  - row
  - span
  - rowSpan
  - role

Output ONLY valid JSON.
Root key must be "screens".
`

// const BLOCK_ORDER = [
//     "profile_image",
//     "content_image",
//     "title_text",
//     "meta_text",
//     "body_text",
//     "primary_action"
// ]


/* ----------------- FUNCTIONS ---------------*/
function applyLayout(design: any, density: keyof typeof DENSITY_MAP) {
    const densityConfig = DENSITY_MAP[density];
    const TOTAL_COLUMNS = 12;

    return {
        ...design,
        screens: design.screens.map((screen: any) => {
            let currentRow = 1;

            // This allows the AI to suggest widths, otherwise we default to 12
            return {
                ...screen,
                frames: screen.frames.map((frame: any) => {
                    const isDominant = frame.role === "dominant";

                    // SMART SPAN LOGIC: Instead of hardcoded col=2
                    // Hero = Wide, Feed = Medium, Sidebar = Narrow
                    let span = frame.span || (isDominant ? 12 : 6);
                    let col = frame.col || (span === 12 ? 1 : (12 - span) / 2 + 1);

                    const rowSpan = isDominant
                        ? densityConfig.dominantRowSpan
                        : densityConfig.supportingRowSpan;

                    const placed = {
                        ...frame,
                        col: Math.floor(col),
                        span: Math.min(span, TOTAL_COLUMNS),
                        row: currentRow,
                        rowSpan,
                        type: "card"
                    };

                    // Only stack vertically if the span is large (Auto-stacking)
                    if (span > 8) {
                        currentRow += rowSpan + densityConfig.rowGap;
                    }

                    return placed;
                })
            };
        })
    };
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
    const { source, prompt, density = "normal" } = req.body

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

        const withLayout = applyLayout(design, density)

        /* -------- NORMALIZE FOR CANVAS -------- */
        const normalized = normalizeForCanvas(withLayout)

        /* ---------- DESIGN PATTERNS ---------- */


        const refinedLayout = await callAI(
            SYSTEM_PROMPT_2,
            normalized
        )

        const finailLayout = normalizeForCanvas(refinedLayout)

        /* -------- VALIDATION(zod) -------- */

        const validation = WireframeSchema.safeParse(finailLayout)

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