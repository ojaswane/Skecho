import Router from "express"
import { generatePreviewScreens } from "../Ai/Preview_Ai.js"

const router = Router()

type DensityLevel = "airy" | "normal" | "compact"

/* ---------------- ROUTE ------------------- */
router.post("/", async (req, res) => {
  const { prompt, imageBase64, density = "airy" } = req.body as {
    prompt?: string
    imageBase64?: string
    density?: DensityLevel
  }

  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  try {
    const screens = await generatePreviewScreens({
      prompt,
      imageBase64,
      density,
    })

    res.write(
      `data: ${JSON.stringify({
        type: "PLAN",
        screens: screens.map((s: any) => s.name),
      })}\n\n`
    )

    for (const screen of screens) {
      res.write(`data: ${JSON.stringify({ type: "SCREEN_DONE", data: screen })}\n\n`)
    }

    res.write("data: [DONE]\n\n")
    res.end()
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

export default router
