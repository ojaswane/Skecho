import * as fabric from "fabric"
import { PATTERNS } from "../render/layoutPatterns/Patterns"
import renderGridLayout from "../render/renderWireframe"

/* ---------------- TYPES ---------------- */

type AIResult = {
    pattern?: keyof typeof PATTERNS
    patterns?: (keyof typeof PATTERNS)[]
}

/* ---------------- MAIN ---------------- */

export default function renderFromAI(
    canvas: fabric.Canvas,
    aiResult: AIResult
) {
    if (!canvas) return

    const patterns =
        aiResult.patterns ??
        (aiResult.pattern ? [aiResult.pattern] : [])

    if (!patterns.length) return

    let rowOffset = 0

    for (const patternKey of patterns) {
        const patternElements = PATTERNS[patternKey]
        if (!patternElements) continue

        // shift pattern vertically
        const shiftedElements = patternElements.map(el => ({
            ...el,
            row: el.row ? el.row + rowOffset : el.row,
        }))

        renderGridLayout(canvas, shiftedElements)

        // spacing between sections (grid)
        rowOffset += 6
    }
}
