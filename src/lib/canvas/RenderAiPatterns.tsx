import * as fabric from "fabric"

type AIScreen = {
  id: string
  name: string
  frameId: string
  elements: {
    id: string
    type: string
    role?: string
    col: number
    row: number
    span: number
    rowSpan: number
  }[]
}
const PADDING = 60
const CELL_W = 120
const CELL_H = 90

export default function renderFromAI(
  canvas: fabric.Canvas,
  screens: AIScreen[]
) {
  if (!screens.length) return

  for (const screen of screens) {
    const frame = canvas.getObjects().find(
      (o: any) =>
        o.get?.("isFrame") &&
        o.get?.("frameId") === screen.frameId
    ) as fabric.Rect

    if (!frame) {
      console.warn("No frame for screen", screen.id)
      continue
    }

    const baseLeft = frame.left!
    const baseTop = frame.top!

    for (const el of screen.elements) {
      const rect = new fabric.Rect({
        left: frame.left! + PADDING + (el.col - 1) * CELL_W,
        top: frame.top! + PADDING + (el.row - 1) * CELL_H,
        width: el.span * CELL_W - 20,
        height: el.rowSpan * CELL_H - 20,
        rx: 8,
        ry: 8,
        fill: "#f4f4f4",
        stroke: "#ccc",
        strokeWidth: 3,
      })

      canvas.add(rect)
    }
  }

  canvas.requestRenderAll()
}
