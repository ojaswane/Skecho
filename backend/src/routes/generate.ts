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
    const { source, payload } = req.body

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