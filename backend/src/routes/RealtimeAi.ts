// this is for realtime generation using gemini-2.5-flash model

import { Router } from "express";

const router = Router()

type DensityLevel = "airy" | "normal" | "compact"

router.post('/', async (req, res) => {
    const { prompt, density = "airy" } = req.body as {
        prompt?: string
        // imageBase64?: string
        density?: DensityLevel
    }

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    try {


        
    } catch (err: any) {
        res.write(
            `data: ${JSON.stringify({
                error: "PIPELINE_ERROR",
                message: err?.message || "Unknown pipeline error",
            })}\n\n`
        )
        res.end()
    }
})