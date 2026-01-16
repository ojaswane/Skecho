import { error } from "console";
import Router from "express";

const router = Router();

// just to test in the browser
router.get("/", (req, res) => {
    res.json({
        status: 'ok',
        message: " Your backend is running sir"
    })
})

// backend build for ai to get the response
router.post("/", (req, res) => {
    const { type, sketch, prompt } = req.body
    if (!prompt) {
        return res.status(400).json({
            error: "prompt is required"
        })
    }

    // if user types the prompt 
    if (type === "text") {
        return res.json({
            source: "text",
            Prompt: prompt,
            elements: [
                { type: "text", value: "Welcome Back" },
                { type: "input", placeholder: "Email" },
                { type: "input", placeholder: "Password" },
                { type: "button", label: "Login" }
            ]
        })
    }

    // if the user does the sketch
    if (type === "sketch") {
        return res.json({
            source: "sketch",
            Sketch_recived: prompt,
            elements: [
                { type: "text", value: "Welcome Back" },
                { type: "input", placeholder: "Email" },
                { type: "input", placeholder: "Password" },
                { type: "button", label: "Login" }
            ]
        })
    }


    res.status(400).json({ error: "Invalid type" })
})
export default router;

// For Me:================
// post : ts is used when we have to send something see this like we see in the form of  i post on X daily
// Get : we use ts when you need to get something like we need this data or look like for instagram it is operating the get operation
// for the post which you have posted Got it?================