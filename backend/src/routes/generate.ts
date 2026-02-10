import fetch from "node-fetch"
import { randomUUID } from "crypto"
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
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
        const cleanJson = match[0]
            .replace(/```json/g, "")
            .replace(/```/g, "");
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error. Raw text found:", match[0]);
        return null;
    }
}

async function* callAI(SYSTEM_PROMPT: string, payload: { imageBase64?: string, prompt?: string }) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Wireframe-App"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                stream: true,
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: payload.prompt || "Generate a UI layout based on this sketch." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: payload.imageBase64
                                }
                            }
                        ]
                    }
                ]
            })
        });


        if (!response.ok) {
            const errBody = await response.json();
            // Defensive: errBody may be any type
            const message = (typeof errBody === 'object' && errBody && 'error' in errBody && typeof errBody.error === 'object' && errBody.error && 'message' in errBody.error)
                ? (errBody.error.message as string)
                : "OpenRouter API Error";
            throw new Error(message);
        }

        // Node.js ReadableStream does not have getReader, so use a polyfill if needed
        let reader: any;
        if (response.body && typeof (response.body as any).getReader === 'function') {
            reader = (response.body as any).getReader();
        } else if (response.body && typeof (response.body as any).on === 'function') {
            // Node.js stream.Readable
            const stream = response.body as NodeJS.ReadableStream;
            const { Readable } = await import('stream');
            const readable = Readable.from(stream);
            const iterator = readable[Symbol.asyncIterator]();
            reader = {
                async read() {
                    const { value, done } = await iterator.next();
                    return { value, done };
                }
            };
        } else {
            throw new Error('No compatible stream reader found');
        }
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(line => line.trim() !== "");

            for (const line of lines) {
                if (line.includes("[DONE]")) return;
                if (!line.startsWith("data: ")) continue;

                try {
                    const data = JSON.parse(line.replace("data: ", ""));
                    const content = data.choices[0]?.delta?.content;
                    if (content) yield content;
                } catch (e) { /* ignore partial chunks */ }
            }
        }
    } catch (error) {
        console.error("AI Fetch Error:", error);
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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const stream1 = callAI(SYSTEM_PROMPT_1, {
            prompt: prompt || "Analyze this sketch and refine it.",
            imageBase64: imageBase64
        });

        const design = await gatherStream(stream1);

        if (!design || !design.screens) {
            console.error("AI failed to return a plan.");
            res.write(`data: ${JSON.stringify({
                error: "AI_PARSE_ERROR",
                message: "The AI didn't return a valid design structure. Check OpenRouter credits."
            })}\n\n`);
            return res.end();
        }
        console.log("AI PLAN RECEIVED:", JSON.stringify(design, null, 2));

        res.write(`data: ${JSON.stringify({
            type: "PLAN",
            screens: design.screens.map((s: any) => ({
                id: s.id || randomUUID(),
                role: s.role || "suggestion"
            }))
        })}\n\n`);

        for (const screen of design.screens) {
            try {
                if (!screen.frames) screen.frames = [];

                const withLayout = applyLayout({ screens: [screen] }, density as any);
                const normalized = normalizeForCanvas(withLayout);

                res.write(`data: ${JSON.stringify({
                    type: "SCREEN_DONE",
                    data: normalized.screens[0]
                })}\n\n`);

            } catch (screenErr) {
                console.error("Error processing screen:", screenErr);
            }
        }

        res.write(`data: [DONE]\n\n`);
        res.end();

    } catch (err) {
        console.error("Pipeline Error:", err);
        // Clean error response
        res.write(`data: ${JSON.stringify({ error: "API_ERROR", message: "Check server logs for quota details" })}\n\n`);
        res.end();
    }
});

export default router