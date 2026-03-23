// This is where the Ai gents all of the design Systems

import * as fabric from "fabric"
import { layoutCard } from "../design-systems/cardLayout/CardLayout"
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
  screens: AIScreen[],
  preset : any
) {
  if (!screens.length) return
  const cardRadius = preset?.radius?.xl ?? preset?.radius?.lg ?? 16
  const blockTheme = {
    background: preset?.color?.neutral100 ?? "#F4F4F5",
    border: preset?.color?.border ?? "#E4E4E7",
    text: preset?.color?.textMuted ?? "#71717A",
    accent: preset?.color?.primary ?? "#4F46E5",
    radius: cardRadius,
  }

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

      // Skip anything that would overflow the frame (quick MVP guardrail).
      if (top + height > frame.top + frame.height - GRID.padding) continue

      /* ---------- CARD ---------- */
      const card = new fabric.Rect({
        left,
        top,
        width,
        height,
        fill: preset.color.card,
        stroke: preset.color.border,
        strokeWidth: 1,
        rx: cardRadius,
        ry: cardRadius,
        shadow: preset.shadow.md,
      })

      card.set("isAiGenerated", true)
      card.set("frameId", screen.frameId)
      card.set("clipPath", frame.clipPath)
      canvas.add(card)

      /* --------- SEMANTIC BLOCKS -------- */
      const laidOutBlocks = layoutCard(el.blocks, width)

      laidOutBlocks.forEach((block) => {
        const obj = renderSemanticBlock({
          ...block,
          left: left + block.left,
          top: top + block.top,
          theme: blockTheme,
        })
        obj.set("clipPath", frame.clipPath)
        obj.set("isAiGenerated", true)
        obj.set("frameId", screen.frameId)
        canvas.add(obj)
      })
    }


    // Frames are background artboards (solid fill). Keep them behind generated UI.
    canvas.sendObjectToBack(frame)
  }
  canvas.requestRenderAll()
}
