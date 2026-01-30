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
        left: baseLeft + (el.col - 1) * 100,
        top: baseTop + (el.row - 1) * 80,
        width: el.span * 100,
        height: el.rowSpan * 80,
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
