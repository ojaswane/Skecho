import fetch from "node-fetch"
import Router from "express"
import { WireframeSchema } from "../../validation/wireframe.schema.js"
import DENSITY_MAP from "../constants/densityMap/density_map.js"
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router()

/* ---------------- TEST ---------------- */

router.get("/", (_, res) => {
    res.json({ status: "ok", message: "Backend running" })
})

/* ---------------- SYSTEM PROMPT ---------------- */
const SYSTEM_PROMPT_1 = `
You are a SENIOR PRODUCT DESIGNER specialized in Yoga/SaaS aesthetics.
You will receive a user's prompt and an image of their hand-drawn sketch.

TASK:
1. REFINEMENT: Interpret the sketch. If the user drew a circle at the top, it's a "dominant" logo or profile. Boxes are "frames". 
2. STRUCTURE: Return a JSON structure representing the refined version of that sketch plus two expansion screens.

YOGA/SAAS STYLE RULES:
- Use SERIF_ELEGANT for dominant headers.
- Use SANS_MODERN for supporting cards.
- Maximize white space (Airy density).

STRICT OUTPUT FORMAT:
(Keep your existing JSON schema here)
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function* callAI(SYSTEM_PROMPT: string, payload: { imageBase64?: string, prompt?: string }) {

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT, // Gemini prompt support
    });

    // Prepare the content parts (Text + Image)
    const parts: any[] = [payload.prompt || "Analyze this sketch for a SaaS layout."];

    if (payload.imageBase64) {
        parts.push({
            inlineData: {
                mimeType: "image/png",
                data: payload.imageBase64.split(",")[1]
            }
        });
    }

    try {
        // Start the stream
        const result = await model.generateContentStream(parts);

        // Iterate through the stream chunks
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                yield chunkText;
            }
        }
    } catch (error) {
        console.error("Gemini Stream Error:", error);
        throw error;
    }
}

async function gatherStream(stream: AsyncGenerator<string>) {
    let fullText = "";
    try {
        for await (const chunk of stream) {
            fullText += chunk;
        }
        const json = extractJSON(fullText);
        if (!json) {
            console.error("AI returned invalid JSON. Raw text:", fullText);
        }
        return json;
    } catch (e) {
        console.error("Error gathering stream:", e);
        return null;
    }
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
    const { prompt, imageBase64, density = "normal" } = req.body;

    // Tell the browser to stay open for a stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Get the Plan 
        const stream1 = callAI(SYSTEM_PROMPT_1, {
            prompt: prompt || "Analyze this sketch and refine it.",
            imageBase64: imageBase64 // This is the crucial link!
        });
        const design = await gatherStream(stream1);
        console.log("AI PLAN:", JSON.stringify(design, null, 2))

        res.write(`data: ${JSON.stringify({
            type: "PLAN",
            screens: design.screens.map((s: any) => ({ id: s.id, role: s.role }))
        })}\n\n`);

        if (!design?.screens) {
            console.error("No screens in design!");
            res.write(`data: ${JSON.stringify({ error: "Failed to plan" })}\n\n`);
            return res.end();
        }

        // Process each screen and PUSH it immediately
        for (const screen of design.screens) {
            try {
                // Ensure frames exist before layout
                if (!screen.frames) screen.frames = [];

                // Layout
                const withLayout = applyLayout({ screens: [screen] }, density as any);
                const normalized = normalizeForCanvas(withLayout);

                // Skip refinement if it's causing the crash
                // For now, let's just send the normalized screen to see it work!
                res.write(`data: ${JSON.stringify({
                    type: "SCREEN_DONE",
                    data: normalized.screens[0]
                })}\n\n`);

            } catch (screenErr) {
                console.error("Error processing individual screen:", screenErr);
            }
        }

    } catch (err) {
        console.error(err);
        res.write(`data: ${JSON.stringify({ error: "Pipeline failed" })}\n\n`);
        res.end();
    }
});

export default router