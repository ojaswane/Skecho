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
const GRID = {
  padding: 48,
  colWidth: 120,
  rowHeight: 96,
  gap: 16,
}

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

    for (const el of screen.elements) {
      const rect = new fabric.Rect({
        left: frame.left! + GRID.padding + (el.col - 1) * (GRID.colWidth + GRID.gap),
        top: frame.top! + GRID.padding + (el.row - 1) * (GRID.rowHeight + GRID.gap),
        width: el.span * GRID.colWidth + (el.span - 1) * GRID.gap,
        height: el.rowSpan * GRID.rowHeight + (el.rowSpan - 1) * GRID.gap,
        rx: 8,
        ry: 8,
        fill: "#f4f4f4",
        stroke: "#ccc",
        strokeWidth: 3,
      })

      rect.set({
        clipPath: frame.clipPath,
      })
      canvas.add(rect)
      canvas.sendObjectBackwards(rect)
      canvas.bringObjectForward(frame)
    }
  }

  canvas.requestRenderAll()
}
