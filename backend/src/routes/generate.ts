import fetch from "node-fetch";
import Router from "express";
import { interpretPrompt } from "../Ai/interpretPrompt";

const router = Router();

// just to test in the browser
router.get("/", (req, res) => {
    res.json({
        status: 'ok',
        message: " Your backend is running sir"
    })
})

// prompt for Ai
const SYSTEMPROMPT = ` You are a MODERN UI wireframe generator for a design tool.

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

// backend build for ai to get the response
router.post("/", (req, res) => {
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
        return res.json({
            elements: [
                {
                    type: "input",
                    x: 100,
                    y: 100,
                    text: "Email"
                },
                {
                    type: "input",
                    x: 100,
                    y: 160,
                    text: "Password"
                },
                {
                    type: "button",
                    x: 100,
                    y: 220,
                    text: "Login"
                }
            ]
        })
    }

    res.status(400).json({ error: "Invalid source" })
})
export default router;

// For Me:================
// post : ts is used when we have to send something see this like we see in the form of  i post on X daily
// Get : we use ts when you need to get something like we need this data or look like for instagram it is operating the get operation
// for the post which you have posted Got it?================