// ts is how the way we are calling the Ai manually
import Router from "express"
import { generatePreviewScreens } from "../Ai/Preview_Ai.js"
import { convertSemanticScreenToFrontend } from "../utils/convertScreenFormat.js"

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

    console.log("[/generate] Got screens from AI:", screens.length, "screens")
    screens.forEach((s: any, i: number) => {
      console.log(`  [${i}] id=${s.id}, name=${s.name}, has_sections=${!!s.sections}, keys=${Object.keys(s.sections || {}).join(",")}`)
    })

    res.write(
      `data: ${JSON.stringify({
        type: "PLAN",
        screens: screens.map((s: any) => s.name),
      })}\n\n`
    )

    for (const screen of screens) {
      console.log("[/generate] Converting screen:", screen.id)
      const convertedScreen = convertSemanticScreenToFrontend(screen)
      console.log("[/generate] Converted screen:", convertedScreen.id, "elements:", convertedScreen.elements.length)
      res.write(`data: ${JSON.stringify({ type: "SCREEN_DONE", data: convertedScreen })}\n\n`)
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
