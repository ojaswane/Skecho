import * as fabric from "fabric"
import type { Screen } from "../../../lib/store/canvasStore"
import type { WireframeElement } from "../../../lib/store/canvasStore"
import renderWireframe from "../render/renderWireframe"

const FRAME_PADDING = 80

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
        o.get?.("frameId") === screen.id
    ) as fabric.Rect | undefined

    if (!frameRect) {
      console.error("No frame for screen", screen.id)
      console.log("Canvas frames:", canvas.getObjects())
      return
    }

    const baseLeft = frameRect.left! + FRAME_PADDING
    const baseTop = frameRect.top! + FRAME_PADDING + screens.indexOf(screen) * (frameRect.height! + 120)

    if (!screen.frames || screen.frames.length === 0) return
    const maxCol = 12

    const maxRow = Math.max(
      ...screen.frames.map(f => (f.row ?? 1) + (f.rowSpan ?? 1) - 1)
    )

    const CELL_WIDTH =
      (frameRect.width! - FRAME_PADDING * 2) / maxCol

    const CELL_HEIGHT =
      (frameRect.height! - FRAME_PADDING * 2) / maxRow

    const elements: WireframeElement[] = screen.frames.map((el) => {
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