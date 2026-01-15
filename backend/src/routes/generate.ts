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
    const { prompt } = req.body
    if (!prompt) {
        return res.status(400).json({
            error: "prompt is required"
        })
    }

    // Fake AI response
    const wireframe = {
        screen: "Login Screen",
        elements: [
            { type: "text", value: "Welcome Back" },
            { type: "input", placeholder: "Email" },
            { type: "input", placeholder: "Password" },
            { type: "button", label: "Login" }
        ]
    }

    res.json({
        status: 200,
        success: true,
        prompt: prompt,
        result: wireframe
    })
})
export default router;

// For Me:================
// post : ts is used when we have to send something see this like we see in the form of  i post on X daily
// Get : we use ts when you need to get something like we need this data or look like for instagram it is operating the get operation
// for the post which you have posted Got it?================