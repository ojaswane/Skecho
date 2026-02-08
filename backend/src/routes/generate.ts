import fetch from "node-fetch"
import Router from "express"
import { WireframeSchema } from "../../validation/wireframe.schema.js"
import DENSITY_MAP from "../constants/densityMap/density_map.js"

const router = Router()

/* ---------------- TEST ---------------- */

router.get("/", (_, res) => {
    res.json({ status: "ok", message: "Backend running" })
})

/* ---------------- SYSTEM PROMPT ---------------- */
const SYSTEM_PROMPT_1 = `
You are a SENIOR PRODUCT DESIGNER.
You will receive a user's prompt and potentially an "existingLayout" (their sketch).

TASK:
1. Identify the 'Refined' screen: This is the user's sketch cleaned up and perfected. 
2. Identify 'Expansion' screens: These are 2 logical "next steps" in the user journey.

STRICT OUTPUT FORMAT:
Output ONLY valid JSON:
{
  "screens": [
    { 
      "role": "refinement", 
      "id": "screen_1", 
      "name": "Refined Sketch", 
      "layoutPattern": "..." 
    },
    { 
      "role": "suggestion", 
      "id": "screen_2", 
      "name": "Suggested Dashboard", 
      "layoutPattern": "..." 
    },
    { 
      "role": "suggestion", 
      "id": "screen_3", 
      "name": "Suggested Settings", 
      "layoutPattern": "..." 
    }
  ]
}

REFINEMENT RULE: If existingLayout is provided, the first screen MUST follow that layout strictly.
EXPANSION RULE: Suggested screens must use the same design language as the refinement.
`;

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

type DensityLevel = 'airy' | 'normal' | 'compact';
function applyLayout(design: any, density: DensityLevel = "normal") {
    //  the specific configuration for the chosen density
    const densityConfig = DENSITY_MAP[density];
    const TOTAL_COLUMNS = 12;

    return {
        ...design,
        screens: design.screens.map((screen: any) => {
            let currentRow = 1;

            return {
                ...screen,
                // Fallback to empty array to prevent mapping over undefined
                frames: (screen.frames || []).map((frame: any) => {
                    const isDominant = frame.role === "dominant";

                    let span = frame.span || (isDominant ? 12 : 6);

                    let col = frame.col || (span === 12 ? 1 : Math.floor((12 - span) / 2) + 1);

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

    // Tell the browser to stay open for a stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Get the Plan 
        const stream1 = callAI(SYSTEM_PROMPT_1, {
            productIntent: prompt
        });
        const design = await gatherStream(stream1);
        console.log("AI PLAN:", JSON.stringify(design, null, 2))

        if (!design?.screens) {
            console.error("No screens in design!");
            res.write(`data: ${JSON.stringify({ error: "Failed to plan" })}\n\n`);
            return res.end();
        }

        // Process each screen and PUSH it immediately
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