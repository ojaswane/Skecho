import * as fabric from "fabric"
import renderGridLayout from "../render/renderWireframe"
import type { Screen, Frame } from "../../../lib/store/canvasStore"

/* ---------------- MAIN ---------------- */

export default function renderFromAI(
    canvas: fabric.Canvas,
    screens: Screen[]
) {
    if (!canvas || !screens.length) return

    let rowOffset = 0

    for (const screen of screens) {
        if (!screen.frames || !screen.frames.length) continue

        // shift frames vertically so screens don’t overlap
        const shiftedFrames: Frame[] = screen.frames.map(frame  => ({
            ...frame,
            row: frame.row ? frame.row + rowOffset : frame.row,
        }))

        // create a base frame (new screen)
        renderGridLayout(canvas, [
            {
                type: "frame",
                width: 1200,
                height: 2000,
            },
            ...shiftedFrames,
        ])

        // add spacing before next screen
        rowOffset += 20
    }
}
