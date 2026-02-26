import { randomUUID } from "crypto";
import Router from "express";
import DENSITY_MAP from "../constants/densityMap/density_map.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();


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

/* ----------------- LAYOUT UTILS ---------------*/
type DensityLevel = 'airy' | 'normal' | 'compact';
function applyLayout(design: any, density: DensityLevel = "normal") {
    const densityConfig = DENSITY_MAP[density];
    const TOTAL_COLUMNS = 12;
    return {
        ...design,
        screens: design.screens.map((screen: any) => {
            let currentRow = 1;
            return {
                ...screen,
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

function normalizeForCanvas(layout: any) {
    layout.screens = layout.screens.map((s, si) => ({
        id: s.id || `screen-${si + 1}`,
        name: s.name || `Screen ${si + 1}`,
        frames: (s.frames || []).map((f, fi) => ({
            id: f.id || `frame-${si}-${fi}`,
            type: f.type || "card",
            role: f.role,
            text: f.text,
            col: f.col ?? f.colStart ?? 1,
            row: f.row ?? f.rowStart ?? 1,
            span: f.span ?? f.colSpan ?? 12,
            rowSpan: f.rowSpan ?? 1,
        })),
    }));
    return layout;
}

function parseGeminiJson(text: string) {
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

async function callGemini(systemPrompt: string, payload: { imageBase64?: string, prompt?: string }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment variables.");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
        }
    });

    const userParts: any[] = [];
    if (payload.prompt) userParts.push({ text: payload.prompt });
    if (payload.imageBase64) {
        const rawData = payload.imageBase64.split(",")[1] || payload.imageBase64;

        userParts.push({
            inlineData: {
                mimeType: "image/png",
                data: rawData
            }
        });
    }
    const result = await model.generateContent({ contents: [{ role: "user", parts: userParts }] });
    let text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) {
        const fallback = result.response.text;
        text = typeof fallback === "function" ? fallback() : fallback || "";
    }
    return text;
}

/* ---------------- ROUTE ------------------- */
router.post("/", async (req, res) => {
    const { prompt, imageBase64, density = "normal" } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        // 1. Get design from Gemini
        const geminiText = await callGemini(SYSTEM_PROMPT_1, {
            prompt: prompt || "Analyze this sketch and refine it.",
            imageBase64: imageBase64
        });
        const design = parseGeminiJson(geminiText);

        if (!design || !design.screens) {
            console.error("AI didn't return a valid design structure. Raw:", geminiText);
            res.write(`data: ${JSON.stringify({
                error: "AI_PARSE_ERROR",
                message: "The AI didn't return a valid design structure. Check Gemini API key/credits.",
                raw: geminiText
            })}\n\n`);
            return res.end();
        }

        // 2. Stream PLAN event
        res.write(`data: ${JSON.stringify({
            type: "PLAN",
            screens: design.screens.map((s: any) => ({
                id: s.id || randomUUID(),
                role: s.role || "suggestion"
            }))
        })}\n\n`);

        // 3. Stream each screen after layout/normalization
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
        res.write(`data: ${JSON.stringify({ error: "API_ERROR", message: "Check server logs for Gemini details" })}\n\n`);
        res.end();
    }
});

export default router;