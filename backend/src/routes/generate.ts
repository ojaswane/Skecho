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

Your job is to convert user intent into a UI layout JSON.
You are NOT a chatbot.

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
SCHEMA (FOLLOW EXACTLY)
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

====================
LAYOUT RULES
====================

- Canvas origin starts at x = 40, y = 40
- Maintain minimum 24px vertical spacing
- Prefer vertical flow
- Use realistic modern web sizes
- Inputs: height 44–48
- Buttons: height 44–48
- Cards: padding assumed, width > 280
- Text elements should not exceed container width

====================
INTELLIGENCE RULES
====================

- If prompt is vague, generate a clean default layout
- If user asks for minimal, reduce number of elements
- If user asks for login/auth:
  - email input
  - password input
  - primary button
- Do NOT hallucinate complex UI unless asked

====================
MULTI-SCREEN RULES
====================

- If user mentions multiple pages, flows, or steps:
  - Create one screen per page
- Common flows:
  - Auth → Dashboard
  - Dashboard → Details
  - List → Create → Edit
- Screens must be ordered logically
- Each screen must start layout at x=40, y=40
- NEVER mix frames from different screens

====================
FAILSAFE
====================

If you are unsure, still return VALID JSON with a basic layout.
NEVER return empty output.
NEVER explain anything.
`

// type of choices in open router response
type OpenRouterResponse = {
    choices: {
        message: {
            content: string
        }
    }[]
}

// backend build for ai to get the response
router.post("/", async (req, res) => {
    const { source, payload } = req.body
    console.log("REQ BODY >>>", req.body);

    if (source === "text") {
        const elements = interpretPrompt(payload.prompt)

        return res.json({
            mode: "text",
            interpretedIntent: {
                elements
            }
        })
    }

    if (source === "sketch") {
        // Ai Response
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat",
                    temperature: 0.25,
                    max_tokens: 600,
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: payload.prompt }
                    ]
                })
            });

            const data = (await response.json()) as OpenRouterResponse;
            const raw = data.choices[0].message.content;

            if (!raw.startsWith("{")) {
                return res.status(400).json({ error: "AI did not return JSON" });
            }
            // we will parse the raw data into nice json
            let parsed: any;
            try {
                parsed = JSON.parse(raw)

            } catch (err) {

                console.error('Error in parsing the json', err)
                return res.status(400).json({ error: "invalid Ai output" })
            }

            // return json to frontend
            return res.json({
                screens: parsed.screens
            })

        } catch (err) {
            console.error('There was an error while calling for AI', err)
            return res.status(500).json({ error: 'Cannot call AI' })
        }
    }

    res.status(400).json({ error: "Invalid source" })
})
export default router;

// For Me:================
// post : ts is used when we have to send something see this like we see in the form of  i post on X daily
// Get : we use ts when you need to get something like we need this data or look like for instagram it is operating the get operation
// for the post which you have posted Got it?================