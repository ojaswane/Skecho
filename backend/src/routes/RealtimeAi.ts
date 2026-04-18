// Realtime SSE generation route using gemini-2.5-flash.
import Router from "express"
import { GenerateRealTimeAi } from "../Ai/RealTime_Ai.js"
import { convertSemanticScreenToFrontend } from "../utils/convertScreenFormat.js"
import { normalizeGeneratedScreensToSections } from "../utils/normalizeGeneratedScreen.js"

const router = Router()

type DensityLevel = "airy" | "normal" | "compact"

function toFrontendScreen(screen: any) {
    if (screen?.sections && typeof screen.sections === "object") {
        return convertSemanticScreenToFrontend(screen)
    }

    const normalized = normalizeGeneratedScreensToSections([screen], "realtime-ai")[0]
    return {
        id: normalized.id,
        name: normalized.name,
        frameId: normalized.frameId,
        elements: normalized.elements.map((element) => ({
            id: element.id,
            type: element.type,
            role: element.role,
            semantic: element.semantic,
            col: element.col ?? 1,
            row: element.row ?? 1,
            span: element.span ?? 12,
            rowSpan: element.rowSpan ?? 1,
            blocks: (element.style as any)?.blocks ?? [],
        })),
    }
}

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
        const screens = await GenerateRealTimeAi({ prompt, imageBase64, density })

        res.write(
            `data: ${JSON.stringify({
                type: "PLAN",
                screens: screens.map((s: any) => s.name),
            })}\n\n`
        )

        for (const screen of screens) {
            const convertedScreen = toFrontendScreen(screen)
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
