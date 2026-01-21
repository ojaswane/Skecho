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
const SYSTEM_PROMPT = ` You are a MODERN UI wireframe generator for a design tool.

STRICT RULES:
- Output ONLY valid JSON.
- No markdown, no explanations, no comments.
- Follow the schema EXACTLY.

Schema:
{
  "frames": [
    {
      "id": "string",
      "type": "frame | card | text | button | input(image / video / 3d element)",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "text": "string (optional)"
    }
  ]
}

Layout rules:
- Start layout at x=40, y=40
- Maintain minimum 24px spacing between elements
- Use realistic sizes for modern web apps
- Prefer cards and vertical flow
- If prompt is vague, generate clean default layout
- If user asks for minimal, generate fewer elements
`

// type of choices in open router response
type OpenRouterResponse = {
    choices: {
        message: {
            content: string;
        }
    }
}

// backend build for ai to get the response
router.post("/", async (req, res) => {
    const { source, payload } = req.body

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

            // we will parse the raw data into nice json
            let parsed;
            try {
                parsed = JSON.parse(raw)

            } catch (err) {

                console.error('Error in parsing the json', err)
                return res.status(400).json({ error: "invalid Ai output" })
            }

            // return json to frontend
            return res.json({ elements: parsed.frames })

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