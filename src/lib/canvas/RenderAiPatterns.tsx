import * as fabric from "fabric"
import { Screen, WireframeElement } from "../../../lib/store/canvasStore"
import renderWireframe from "../render/renderWireframe"

const FRAME_PADDING = 120
const CELL_WIDTH = 90
const CELL_HEIGHT = 80

export default function renderFromAI(
    canvas: fabric.Canvas,
    screens: Screen[]
) {
    if (!canvas || !screens.length) {
        console.warn("renderFromAI: nothing to render")
        return
    }

    screens.forEach((screen) => {
        const frame = canvas
            .getObjects()
            .find(
                (o: any) =>
                    o.get?.("isFrame") &&
                    o.get?.("frameId") === screen.frame.id
            ) as fabric.Rect | undefined

        if (!frame) {
            console.warn("Frame not found for screen", screen.id)
            return
        }

        const baseLeft = frame.left! + FRAME_PADDING
        const baseTop = frame.top! + FRAME_PADDING

        screen.elements.forEach((el) => {
            const col = el.col ?? 1
            const row = el.row ?? 1
            const span = el.span ?? 1
            const rowSpan = el.rowSpan ?? 1

            const element: WireframeElement = {
                ...el,
                left: baseLeft + (col - 1) * CELL_WIDTH,
                top: baseTop + (row - 1) * CELL_HEIGHT,
                width: span * CELL_WIDTH - 20,
                height: rowSpan * CELL_HEIGHT - 20,
            }

            renderWireframe(canvas, [element])
        })

        // ensure elements appear above frame
        canvas.getObjects().forEach((obj) => {
            if (!(obj as any).isFrame) {
                canvas.bringObjectToFront(obj)
            }
        })
    })

    canvas.requestRenderAll()
}
