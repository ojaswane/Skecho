import * as fabric from "fabric"
import type { Screen } from "../../../lib/store/canvasStore"
import type { WireframeElement } from "../../../lib/store/canvasStore"
import renderWireframe from "../render/renderWireframe"

const FRAME_PADDING = 80
const CELL_WIDTH = 80
const CELL_HEIGHT = 72
const INNER_GAP = 24

export default function renderFromAI(
  canvas: fabric.Canvas,
  screens: Screen[]
) {
  if (!canvas || !screens.length) return

  screens.forEach((screen) => {
    const frameRect = canvas.getObjects().find(
      (o: any) =>
        o.get?.("isFrame") &&
        o.get?.("frameId") === screen.frame.id
    ) as fabric.Rect | undefined

    if (!frameRect) {
      console.warn("Frame not found for screen", screen.id)
      return
    }

    const baseLeft = frameRect.left! + FRAME_PADDING
    const baseTop = frameRect.top! + FRAME_PADDING

    const elements: WireframeElement[] = screen.elements.map((el) => {
      const col = el.col ?? 1
      const row = el.row ?? 1
      const span = el.span ?? 1
      const rowSpan = el.rowSpan ?? 1

      return {
        id: el.id,
        type: el.type,
        role: el.role,

        col,
        row,
        span,
        rowSpan,

        left: baseLeft + (col - 1) * CELL_WIDTH + INNER_GAP / 2,
        top: baseTop + (row - 1) * CELL_HEIGHT + INNER_GAP / 2,
        width: span * CELL_WIDTH - INNER_GAP,
        height: rowSpan * CELL_HEIGHT - INNER_GAP,
      }
    })

    renderWireframe(canvas, elements)
  })

  canvas.requestRenderAll()
}