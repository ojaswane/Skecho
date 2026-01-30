import { createFrame } from "../../components/canvas/options_pages/Frame/createFrame"
import { addObjectToFrame } from "../../components/canvas/options_pages/Frame/AddFrame"
import * as fabric from "fabric"

type AIScreen = {
  id: string
  name: string
  frame: {
    width: number
    height: number
  }
  elements: {
    id: string
    type: string
    col: number
    row: number
    span: number
    rowSpan: number
  }[]
}

const GAP = 200

const renderFromAI = (
  canvas: fabric.Canvas,
  screens: AIScreen[]
) => {
  const framesMap = new Map<string, fabric.Group>()

  /* 1. CREATE FRAMES */
  screens.forEach((screen, index) => {
    const left = 100 + index * (screen.frame.width + GAP)
    const top = 100

    const frame = createFrame({
      canvas,
      id: screen.id,
      left,
      top,
      width: screen.frame.width,
      height: screen.frame.height,
      name: screen.name,
    })

    framesMap.set(screen.id, frame)
  })

  /* 2. ADD ELEMENTS */
  screens.forEach((screen) => {
    const frame = framesMap.get(screen.id)
    if (!frame) return

    screen.elements.forEach((el) => {
      const CELL_W = 120
      const CELL_H = 80

      const rect = new fabric.Rect({
        left: (el.col - 1) * CELL_W,
        top: (el.row - 1) * CELL_H,
        width: el.span * CELL_W,
        height: el.rowSpan * CELL_H,
        rx: 8,
        ry: 8,
        fill: "#f4f4f4",
        stroke: "#ccc",
        strokeWidth: 1,
        selectable: true,
      })

      rect.set("elementId", el.id)
      rect.set("elementType", el.type)

      addObjectToFrame(frame, rect, canvas)
    })
  })

  canvas.requestRenderAll()
}

export default renderFromAI
