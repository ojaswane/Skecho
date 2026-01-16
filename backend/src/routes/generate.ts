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
    const { source, payload, prompt } = req.body


    // if user types the prompt 
    if (source === "text") {
        return res.json({
            mode: "text",
            Prompt: prompt,
            interpretedIntent: {
                screen: "login",
                fields: ["email", "password"],
                buttons: ["login"]
            }
        })
    }

    // if the user does the sketch
    if (source === "sketch") {
        return res.json({
            mode: "sketch",
            interpretedIntent: {
                components: payload.sketch?.shapes ?? []
            }
        })
    }


    res.status(400).json({ error: "Invalid type" })
})
export default router;

// For Me:================
// post : ts is used when we have to send something see this like we see in the form of  i post on X daily
// Get : we use ts when you need to get something like we need this data or look like for instagram it is operating the get operation
// for the post which you have posted Got it?================