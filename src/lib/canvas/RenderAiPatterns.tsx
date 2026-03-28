// This is where the Ai gents all of the design Systems
// Ts is the render

//This is the flow of : user Sketch something -> then it will be converted into the groups like (nabv/ hero ) -> send the payload to the backend
// -> then backend sends this to Gemini -> THen gemini will send us the data to this file and then this renders the payload from gemini
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
  rowHeight: 96,
  gap: 16,
}

export default function renderFromAI(
  canvas: fabric.Canvas,
  screens: AIScreen[],
  preset: any // This is the JSON tossed by the gemini to frontend
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

    // Compute a grid that fits inside the actual frame width (prevents overflow).
    const cols = 12
    const padding = GRID.padding
    const gap = GRID.gap

    const colWidth = Math.max(24, (frame.width - padding * 2 - gap * (cols - 1)) / cols
    )
    const rowHeight = GRID.rowHeight

    for (const el of screen.elements) {
      const left = frame.left + padding + (el.col - 1) * (colWidth + gap)

      const top = frame.top + padding + (el.row - 1) * (rowHeight + gap)

      const width = el.span * colWidth + (el.span - 1) * gap

      const height = el.rowSpan * rowHeight + (el.rowSpan - 1) * gap

      // Clamp to frame bounds (both directions).
      const maxW = frame.left + frame.width - padding - left
      const maxH = frame.top + frame.height - padding - top
      if (maxW <= 1 || maxH <= 1) continue
      const safeWidth = Math.max(1, Math.min(width, maxW))
      const safeHeight = Math.max(1, Math.min(height, maxH))

      // Skip anything that would overflow the frame (quick MVP guardrail).
      if (top + safeHeight > frame.top + frame.height - padding) continue

      /* ---------- CARD ---------- */
      const card = new fabric.Rect({
        left,
        top,
        width: safeWidth,
        height: safeHeight,
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
      const laidOutBlocks = layoutCard(el.blocks, safeWidth)

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
