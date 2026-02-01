import * as fabric from "fabric"
import { layoutCard } from "../../../backend/src/design-systems/cardLayout/CardLayout"
import { renderSemanticBlock } from "@/lib/render/renderSemanticBlock"


type AIScreen = {
  id: string
  name: string
  frameId: string
  elements: {
    id: string
    role?: string
    col: number
    row: number
    span: number
    rowSpan: number

    blocks: {
      id: string
      kind:
      | "profile_image"
      | "content_image"
      | "title_text"
      | "body_text"
      | "meta_text"
      | "primary_action"
    }[]
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
      const left =
        frame.left + GRID.padding + (el.col - 1) * (GRID.colWidth + GRID.gap)

      const top =
        frame.top + GRID.padding + (el.row - 1) * (GRID.rowHeight + GRID.gap)

      const width =
        el.span * GRID.colWidth + (el.span - 1) * GRID.gap

      const height =
        el.rowSpan * GRID.rowHeight + (el.rowSpan - 1) * GRID.gap

      /* ---------- CARD ---------- */
      const card = new fabric.Rect({
        left,
        top,
        width,
        height,
        rx: 12,
        ry: 12,
        fill: "#f9fafb",
        stroke: "#e5e7eb",
        strokeWidth: 1,
        selectable: false
      })

      card.set("clipPath", frame.clipPath)
      canvas.add(card)

      /* --------- SEMANTIC BLOCKS -------- */
      const laidOutBlocks = layoutCard(el.blocks, width)

      laidOutBlocks.forEach((block) => {
        renderSemanticBlock(canvas, {
          ...block,
          left: left + block.left,
          top: top + block.top
        })
      })
    }


    canvas.bringObjectToFront(frame)
  }
  canvas.requestRenderAll()
}