import * as fabric from "fabric"
import render from "../render/renderWireframe"
import { Screen } from "../../../lib/store/canvasStore"

export default function renderFromAI(
    canvas: fabric.Canvas,
    screens: Screen[]
) {
    if (!canvas || !screens.length) {
        console.warn("renderFromAI: nothing to render")
        return
    }

    let rowOffset = 0

    for (const screen of screens) {
        if (!screen.elements?.length) continue

        const shiftedElements = screen.elements.map(el => ({
            ...el,
            row: (el.row ?? 1) + rowOffset,
        }))

        render(canvas, [
            {
                type: "frame",
                width: screen.frame.width,
                height: screen.frame.height,
            },
            ...shiftedElements,
        ])

        rowOffset += 12 // spacing between screens
    }

    canvas.requestRenderAll()
}
