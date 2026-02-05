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

async function* callAI(system: string, payload: any) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            stream: true,
            messages: [
                { role: "system", content: system },
                { role: "user", content: JSON.stringify(payload) }
            ]
        })
    });

    if (!response.body) return;

    // Casting to any here solves the TS error while keeping the logic functional
    const reader = (response.body as any).getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // OpenRouter/OpenAI send multiple 'data: {...}' blocks in one chunk
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') return;

            try {
                const parsed = JSON.parse(message);
                const content = parsed.choices[0]?.delta?.content;
                if (content) yield content;
            } catch (e) {
                // Ignore partial JSON chunks
            }
        }
    }
}

async function gatherStream(stream: AsyncGenerator<string>) {
    let fullText = "";
    for await (const chunk of stream) {
        // OpenRouter streams often wrap chunks in 'data: {...}' strings
        // This is a simple way to extract the actual content
        fullText += chunk;
    }
    return extractJSON(fullText); // Use your existing extractJSON function
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
    const { prompt, density = "normal" } = req.body;

    // 1. Tell the browser to stay open for a stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // 2. Stage 1: Get the Plan (The list of screens)
        const stream1 = callAI(SYSTEM_PROMPT_1, {
            productIntent: prompt
        });
        const design = await gatherStream(stream1);

        if (!design?.screens) {
            res.write(`data: ${JSON.stringify({ error: "Failed to plan" })}\n\n`);
            return res.end();
        }

        // 3. Stage 2: Process each screen and PUSH it immediately
        for (const screen of design.screens) {
            // Apply layout to just THIS screen
            const withLayout = applyLayout({ screens: [screen] }, density);
            const normalized = normalizeForCanvas(withLayout);

            // Ask the Design Enforcer to fix THIS specific screen
            const stream2 = callAI(SYSTEM_PROMPT_2, normalized);
            const refinedScreen = await gatherStream(stream2);

            // SEND TO USER IMMEDIATELY
            res.write(`data: ${JSON.stringify({ type: "SCREEN_DONE", data: refinedScreen.screens[0] })}\n\n`);
        }

        res.write('data: {"type": "COMPLETE"}\n\n');
        res.end();

    } catch (err) {
        console.error(err);
        res.write(`data: ${JSON.stringify({ error: "Pipeline failed" })}\n\n`);
        res.end();
    }
});

export default router