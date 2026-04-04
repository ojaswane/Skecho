// This is where the Ai gents all of the design Systems
// Ts is the render

//This is the flow of : user Sketch something -> then it will be converted into the groups like (nabv/ hero ) -> send the payload to the backend
// -> then backend sends this to Gemini -> THen gemini will send us the data to this file and then this renders the payload from gemini

// ================ heuristics on sketcho =====================
// If a box is long + thin + at the very top → call it nav
// If a box is very tall + stuck to left/right edge → call it sidebar
// If there are 3 similar boxes in one row → call it feature_grid
// If there are 4–6 thin wide rows stacked → call it faq
// If a box is tiny and pill-shaped → call it cta

import * as fabric from "fabric"
import { layoutCard } from "../design-systems/cardLayout/CardLayout"
import { renderSemanticBlock } from "@/lib/render/renderSemanticBlock"

// clamp a number between min and max
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

type AIScreen = {
  id: string
  name: string
  frameId: string
  elements: {
    id: string
    role?: string
    semantic?: string
    // Normalized bbox (0..1) from sketchGraph strict mode.
    // If present, we render in absolute coordinates (matches sketch more closely).
    bbox?: { x: number; y: number; w: number; h: number }
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
    background: preset?.color?.card ?? preset?.color?.neutral100 ?? "#F4F4F5",
    border: preset?.color?.borderStrong ?? preset?.color?.border ?? "#E4E4E7",
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
      const semantic = String((el as any).semantic ?? "").toLowerCase()
      const bbox = (el as any).bbox

      // use absolute coordinates if bbox is present (sketchGraph strict mode), otherwise use grid-based layout
      const useAbsolute =
        bbox &&
        typeof bbox.x === "number" &&
        typeof bbox.y === "number" &&
        typeof bbox.w === "number" &&
        typeof bbox.h === "number"

      // Grid-based positioning (default) vs absolute positioning (strict sketchGraph mode).
      const edgePad = useAbsolute ? 0 : padding

      let left = useAbsolute
        ? frame.left + clamp(bbox.x, 0, 1) * frame.width
        : frame.left + padding + (el.col - 1) * (colWidth + gap)

      let top = useAbsolute
        ? frame.top + clamp(bbox.y, 0, 1) * frame.height
        : frame.top + padding + (el.row - 1) * (rowHeight + gap)

      const width = useAbsolute
        ? clamp(bbox.w, 0.01, 1) * frame.width
        : el.span * colWidth + (el.span - 1) * gap

      const height = useAbsolute
        ? clamp(bbox.h, 0.01, 1) * frame.height
        : el.rowSpan * rowHeight + (el.rowSpan - 1) * gap

      // Clamp to frame bounds (both directions).
      left = Math.max(frame.left + edgePad, left)
      top = Math.max(frame.top + edgePad, top)
      const maxW = frame.left + frame.width - edgePad - left
      const maxH = frame.top + frame.height - edgePad - top
      if (maxW <= 1 || maxH <= 1) continue
      let safeWidth = Math.max(1, Math.min(width, maxW))
      let safeHeight = Math.max(1, Math.min(height, maxH))

      // Skip anything that would overflow the frame (quick MVP guardrail).
      if (!useAbsolute && top + safeHeight > frame.top + frame.height - padding) continue

      // Premium alignment pass (only for strict mode )
      if (useAbsolute) {
        const grid = 8
        const margin = clamp(frame.width * 0.04, 16, 36)
        const snap = (v: number) => Math.round(v / grid) * grid

        // Horizontal alignment rules by semantic
        if (semantic === "nav" || semantic === "footer") {
          const maxW = frame.width - margin * 2
          const w = Math.min(safeWidth, maxW)

          left = frame.left + (frame.width - w) / 2
          safeWidth = w

        } else if (semantic === "sidebar") {

          const maxW = frame.width * 0.28
          const w = Math.min(safeWidth, maxW)
          left = frame.left + margin
          top = Math.max(top, frame.top + margin)
          safeWidth = w
        }
        else if (semantic === "cta") {
          // Center CTA inside its own box
          left = left + (safeWidth - Math.min(safeWidth, frame.width * 0.45)) / 2
        } else {
          // Default: snap to a clean left margin if box is wide
          if (safeWidth >= frame.width * 0.6) {
            const w = Math.min(safeWidth, frame.width - margin * 2)
            left = frame.left + margin
            safeWidth = w
          }
        }

        // Snap to grid
        left = snap(left)
        top = snap(top)
        safeWidth = snap(safeWidth)
        safeHeight = snap(safeHeight)

        // Clamp to frame bounds again after snapping
        left = Math.max(frame.left + margin, Math.min(left, frame.left + frame.width - margin - safeWidth))
        top = Math.max(frame.top + margin, Math.min(top, frame.top + frame.height - margin - safeHeight))
      }

      /**
       * Semantic-first rendering:
       * - Don't wrap everything in a generic "card".
       * - Render different skeletons depending on element semantic.
       */

      const addObj = (o: fabric.Object) => {
        o.set("clipPath", frame.clipPath)
        o.set("isAiGenerated", true)
        o.set("frameId", screen.frameId)
        canvas.add(o)
      }

      // Responsive measurements for this element box (prevents overflow + looks less "rough")
      const pad = clamp(Math.min(safeWidth, safeHeight) * 0.08, 12, 32)
      const textFamily = preset?.typography?.fontFamily ?? "Inter, Arial"

      const addPill = (opts: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string }) => {
        const pill = new fabric.Rect({
          left: opts.x,
          top: opts.y,
          width: Math.max(1, opts.w),
          height: Math.max(1, opts.h),
          fill: opts.fill ?? (preset?.color?.neutral200 ?? "#e2e8f0"),
          stroke: opts.stroke,
          strokeWidth: opts.stroke ? 1 : 0,
          rx: 999,
          ry: 999,
          selectable: false,
          evented: false,
        })
        addObj(pill)
        return pill
      }

      const addText = (opts: { x: number; y: number; w: number; text: string; size: number; weight?: number; fill?: string; lh?: number }) => {
        const t = new fabric.Textbox(opts.text, {
          left: opts.x,
          top: opts.y,
          width: Math.max(1, opts.w),
          fontFamily: textFamily,
          fontSize: opts.size,
          fontWeight: (opts.weight ?? 600) as any,
          fill: opts.fill ?? (preset?.color?.textPrimary ?? "#0f172a"),
          lineHeight: opts.lh ?? 1.15,
          selectable: false,
          evented: false,
        } as any)
        addObj(t)
        return t
      }

      // NAV: simple top bar pills (logo + links + CTA)
      if (semantic === "nav") {
        const barH = Math.min(safeHeight, clamp(safeWidth * 0.12, 44, 72))
        const inPad = clamp(barH * 0.22, 10, 18)
        const pillH = clamp(barH * 0.45, 20, 30)
        const pillY = top + (barH - pillH) / 2

        const bar = new fabric.Rect({
          left,
          top,
          width: safeWidth,
          height: barH,
          fill: preset?.color?.card ?? "#ffffff",
          stroke: preset?.color?.border ?? "#e5e7eb",
          strokeWidth: 1,
          rx: cardRadius,
          ry: cardRadius,
          shadow: preset?.shadow?.sm ?? preset?.shadow?.md,
        })
        addObj(bar)

        const ctaW = Math.min(safeWidth - inPad * 2, clamp(safeWidth * 0.18, 88, 136))
        const ctaX = left + safeWidth - inPad - ctaW
        const cta = new fabric.Rect({
          left: ctaX,
          top: pillY,
          width: ctaW,
          height: pillH,
          fill: preset?.color?.primary ?? "#4f46e5",
          rx: 999,
          ry: 999,
          selectable: false,
          evented: false,
        })
        addObj(cta)

        addText({
          x: ctaX,
          y: pillY + pillH * 0.2,
          w: ctaW,
          text: "Get started",
          size: clamp(pillH * 0.45, 11, 14),
          weight: 700,
          fill: preset?.color?.onPrimary ?? "#ffffff",
          lh: 1.0,
        })

        // Left-side logo + a few link pills that stop before the CTA.
        const logoW = Math.min(ctaX - (left + inPad) - 12, clamp(safeWidth * 0.16, 76, 116))
        const logo = addPill({
          x: left + inPad,
          y: pillY,
          w: Math.max(40, logoW),
          h: pillH,
          fill: preset?.color?.neutral100 ?? "#f1f5f9",
          stroke: preset?.color?.border ?? "#e5e7eb",
        })
        addText({
          x: logo.left!,
          y: pillY + pillH * 0.2,
          w: logo.width!,
          text: "Sketcho",
          size: clamp(pillH * 0.45, 11, 14),
          weight: 700,
          fill: preset?.color?.textPrimary ?? "#0f172a",
          lh: 1.0,
        })

        let cursorX = left + inPad + logo.width! + clamp(pillH * 0.5, 10, 14)
        const maxX = ctaX - inPad - 8
        const space = Math.max(0, maxX - cursorX)
        const linkGap = clamp(pillH * 0.35, 6, 12)
        const minLinkW = clamp(safeWidth * 0.08, 44, 72)
        const maxLinkW = clamp(safeWidth * 0.12, 56, 96)

        // Fill the available space with evenly sized link pills.
        // This makes the nav feel centered even when the sketch box is slightly off.
        let count = Math.min(6, Math.max(2, Math.floor((space + linkGap) / (minLinkW + linkGap))))
        while (count >= 2) {
          const w = (space - linkGap * (count - 1)) / count
          if (w >= minLinkW * 0.95) break
          count--
        }
        const linkW = clamp((space - linkGap * (count - 1)) / Math.max(1, count), minLinkW, maxLinkW)

        for (let i = 0; i < count; i++) {
          const x = cursorX + i * (linkW + linkGap)
          if (x + linkW > maxX + 0.5) break
          addPill({
            x,
            y: pillY,
            w: linkW,
            h: pillH,
            fill: preset?.color?.neutral100 ?? "#f1f5f9",
            stroke: preset?.color?.border ?? "#e5e7eb",
          })
        }
        continue
      }

      // SIDEBAR: vertical navigation panel (logo + menu pills + account chip)
      if (semantic === "sidebar") {
        // Dark premium sidebar styling (matches reference)
        const sidebarBg = preset?.color?.sidebarBg ?? "#141416"
        const sidebarBorder = preset?.color?.sidebarBorder ?? "#232328"
        const textLight = preset?.color?.textPrimary ?? "#E7EAF0"
        const textMuted = preset?.color?.textMuted ?? "#9CA3AF"
        const itemFill = preset?.color?.sidebarItem ?? "#1B1B20"
        const itemActive = preset?.color?.sidebarActive ?? "#3B32B2"
        const buttonFill = preset?.color?.sidebarButton ?? "#5B5BFF"

        const panel = new fabric.Rect({
          left,
          top,
          width: safeWidth,
          height: safeHeight,
          fill: sidebarBg,
          stroke: sidebarBorder,
          strokeWidth: 1,
          rx: cardRadius,
          ry: cardRadius,
          shadow: preset?.shadow?.md,
        })
        addObj(panel)

        const innerPad = clamp(Math.min(safeWidth, safeHeight) * 0.09, 14, 26)
        const x = left + innerPad
        let y = top + innerPad

        // Brand row
        const brandH = clamp(Math.min(safeWidth, safeHeight) * 0.08, 22, 30)
        const brandIconR = clamp(brandH * 0.35, 6, 10)
        const icon = new fabric.Circle({
          left: x + brandIconR,
          top: y + brandH / 2,
          radius: brandIconR,
          originX: "center",
          originY: "center",
          fill: "#ffffff",
          selectable: false,
          evented: false,
        })
        addObj(icon)
        addText({
          x: x + brandIconR * 2 + clamp(brandH * 0.4, 6, 10),
          y: y + brandH * 0.1,
          w: safeWidth - innerPad * 2,
          text: "Workly",
          size: clamp(brandH * 0.75, 12, 16),
          weight: 700,
          fill: textLight,
          lh: 1.0,
        })
        y += brandH + clamp(brandH * 0.6, 10, 16)

        // Search bar
        const searchH = clamp(brandH * 1.2, 26, 34)
        const search = new fabric.Rect({
          left: x,
          top: y,
          width: Math.max(1, safeWidth - innerPad * 2),
          height: searchH,
          fill: itemFill,
          stroke: sidebarBorder,
          strokeWidth: 1,
          rx: 999,
          ry: 999,
          selectable: false,
          evented: false,
        })
        addObj(search)
        addText({
          x: x + searchH * 0.5,
          y: y + searchH * 0.22,
          w: safeWidth - innerPad * 2 - searchH,
          text: "Search...",
          size: clamp(searchH * 0.38, 10, 13),
          weight: 500,
          fill: textMuted,
          lh: 1.0,
        })
        y += searchH + clamp(searchH * 0.7, 10, 16)

        const itemH = clamp(Math.min(safeWidth, safeHeight) * 0.085, 22, 30)
        const itemGap = clamp(itemH * 0.45, 8, 14)
        const menu = ["Home", "Notifications", "Tasks", "Settings"]

        menu.forEach((label, i) => {
          const isActive = label === "Tasks"
          const row = new fabric.Rect({
            left: x,
            top: y,
            width: Math.max(1, safeWidth - innerPad * 2),
            height: itemH,
            fill: isActive ? itemActive : "transparent",
            rx: 999,
            ry: 999,
            selectable: false,
            evented: false,
          })
          addObj(row)
          const dot = new fabric.Circle({
            left: x + itemH * 0.5,
            top: y + itemH / 2,
            radius: clamp(itemH * 0.22, 4, 6),
            originX: "center",
            originY: "center",
            fill: isActive ? "#FFFFFF" : "#6B7280",
            selectable: false,
            evented: false,
          })
          addObj(dot)
          addText({
            x: x + itemH * 0.9,
            y: y + itemH * 0.2,
            w: safeWidth - innerPad * 2 - itemH,
            text: label,
            size: clamp(itemH * 0.48, 11, 14),
            weight: isActive ? 700 : 600,
            fill: textLight,
            lh: 1.0,
          })
          y += itemH + itemGap
        })

        // Section label
        addText({
          x,
          y: y + itemGap * 0.2,
          w: safeWidth - innerPad * 2,
          text: "OTHER",
          size: clamp(itemH * 0.42, 10, 12),
          weight: 700,
          fill: textMuted,
          lh: 1.0,
        })
        y += clamp(itemH * 0.9, 18, 24)

        const otherItems = ["Documentation", "Settings", "Inbox", "Support"]
        otherItems.forEach((label) => {
          const row = new fabric.Rect({
            left: x,
            top: y,
            width: Math.max(1, safeWidth - innerPad * 2),
            height: itemH,
            fill: "transparent",
            rx: 999,
            ry: 999,
            selectable: false,
            evented: false,
          })
          addObj(row)
          const dot = new fabric.Circle({
            left: x + itemH * 0.5,
            top: y + itemH / 2,
            radius: clamp(itemH * 0.2, 4, 6),
            originX: "center",
            originY: "center",
            fill: "#6B7280",
            selectable: false,
            evented: false,
          })
          addObj(dot)
          addText({
            x: x + itemH * 0.9,
            y: y + itemH * 0.2,
            w: safeWidth - innerPad * 2 - itemH,
            text: label,
            size: clamp(itemH * 0.46, 10, 13),
            weight: 600,
            fill: textLight,
            lh: 1.0,
          })
          y += itemH + itemGap
        })

        // Bottom CTA card
        const ctaCardH = clamp(safeHeight * 0.2, 80, 120)
        const ctaY = top + safeHeight - innerPad - ctaCardH - clamp(itemH * 1.2, 26, 36)
        const ctaCard = new fabric.Rect({
          left: x,
          top: ctaY,
          width: Math.max(1, safeWidth - innerPad * 2),
          height: ctaCardH,
          fill: itemFill,
          stroke: sidebarBorder,
          strokeWidth: 1,
          rx: clamp(cardRadius, 14, 22),
          ry: clamp(cardRadius, 14, 22),
          selectable: false,
          evented: false,
        })
        addObj(ctaCard)
        addText({
          x: x + innerPad * 0.6,
          y: ctaY + innerPad * 0.5,
          w: ctaCard.width!,
          text: "Boost with AI",
          size: clamp(itemH * 0.52, 12, 15),
          weight: 700,
          fill: textLight,
          lh: 1.0,
        })
        addText({
          x: x + innerPad * 0.6,
          y: ctaY + innerPad * 1.4,
          w: ctaCard.width! * 0.9,
          text: "AI-powered replies, tag insights, and tools that save hours.",
          size: clamp(itemH * 0.38, 9, 11),
          weight: 500,
          fill: textMuted,
          lh: 1.2,
        })
        const btnH = clamp(itemH * 0.9, 22, 30)
        const btnW = Math.min(ctaCard.width! - innerPad * 1.2, clamp(ctaCard.width! * 0.7, 90, 150))
        const btn = new fabric.Rect({
          left: x + innerPad * 0.6,
          top: ctaY + ctaCardH - btnH - innerPad * 0.6,
          width: btnW,
          height: btnH,
          fill: buttonFill,
          rx: 999,
          ry: 300,
          selectable: true,
          evented: true,
        })
        addObj(btn)
        addText({
          x: btn.left!,
          y: btn.top! + btnH * 0.22,
          w: btnW,
          text: "Upgrade to Pro",
          size: clamp(btnH * 0.45, 10, 13),
          weight: 700,
          fill: "#ffffff",
          lh: 1.0,
        })

        // Profile chip
        const chipH = clamp(itemH * 1.25, 26, 36)
        const chipY = top + safeHeight - innerPad - chipH
        const chip = new fabric.Rect({
          left: x,
          top: chipY,
          width: Math.max(1, safeWidth - innerPad * 2),
          height: chipH,
          fill: itemFill,
          stroke: sidebarBorder,
          strokeWidth: 1,
          rx: 999,
          ry: 999,
          selectable: false,
          evented: false,
        })
        addObj(chip)
        const avatarR = clamp(chipH * 0.3, 6, 9)
        const avatar = new fabric.Circle({
          left: x + chipH * 0.55,
          top: chipY + chipH / 2,
          radius: avatarR,
          originX: "center",
          originY: "center",
          fill: "#64748b",
          selectable: false,
          evented: false,
        })
        addObj(avatar)
        addText({
          x: x + chipH * 1.1,
          y: chipY + chipH * 0.18,
          w: safeWidth - innerPad * 2 - chipH * 1.2,
          text: "Damir S.",
          size: clamp(chipH * 0.45, 11, 13),
          weight: 650,
          fill: textLight,
          lh: 1.0,
        })
        addText({
          x: x + chipH * 1.1,
          y: chipY + chipH * 0.58,
          w: safeWidth - innerPad * 2 - chipH * 1.2,
          text: "damirschdev@gmail.com",
          size: clamp(chipH * 0.32, 9, 11),
          weight: 500,
          fill: textMuted,
          lh: 1.0,
        })
        continue
      }

      // FOOTER: wide link bar (brand + link pills)
      if (semantic === "footer") {
        const barH = Math.min(safeHeight, clamp(safeWidth * 0.12, 46, 88))
        const bar = new fabric.Rect({
          left,
          top,
          width: safeWidth,
          height: barH,
          fill: preset?.color?.card ?? "#ffffff",
          stroke: preset?.color?.border ?? "#e5e7eb",
          strokeWidth: 1,
          rx: cardRadius,
          ry: cardRadius,
          shadow: preset?.shadow?.sm ?? preset?.shadow?.md,
        })
        addObj(bar)

        const inPad = clamp(barH * 0.22, 10, 18)
        const pillH = clamp(barH * 0.35, 16, 24)
        const y = top + (barH - pillH) / 2
        const brandW = Math.min(safeWidth - inPad * 2, clamp(safeWidth * 0.22, 80, 140))

        addPill({
          x: left + inPad,
          y,
          w: brandW,
          h: pillH,
          fill: preset?.color?.neutral100 ?? "#f1f5f9",
          stroke: preset?.color?.border ?? "#e5e7eb",
        })
        addText({
          x: left + inPad,
          y: y + pillH * 0.2,
          w: brandW,
          text: "Sketcho",
          size: clamp(pillH * 0.55, 10, 14),
          weight: 800,
          fill: preset?.color?.textPrimary ?? "#0f172a",
          lh: 1.0,
        })

        const linkW = clamp(safeWidth * 0.11, 52, 88)
        const linkGap = clamp(pillH * 0.35, 6, 12)
        let cursorX = left + inPad + brandW + linkGap
        const maxX = left + safeWidth - inPad
        let added = 0
        while (cursorX + linkW <= maxX && added < 6) {
          addPill({
            x: cursorX,
            y,
            w: linkW,
            h: pillH,
            fill: preset?.color?.neutral100 ?? "#f1f5f9",
            stroke: preset?.color?.border ?? "#e5e7eb",
          })
          cursorX += linkW + linkGap
          added++
        }
        continue
      }

      // CTA: just a pill button (no card wrapper)
      if (semantic === "cta") {
        const btnW = Math.min(safeWidth, clamp(safeWidth * 0.9, 120, 280))
        const btnH = Math.min(safeHeight, clamp(btnW * 0.18, 34, 52))
        const btn = new fabric.Rect({
          left,
          top,
          width: btnW,
          height: btnH,
          fill: preset?.color?.primary ?? "#4f46e5",
          rx: 999,
          ry: 999,
          shadow: preset?.shadow?.sm ?? preset?.shadow?.md,
        })
        addObj(btn)
        const txt = new fabric.Text("Get started", {
          left: left + btnW / 2,
          top: top + btnH / 2,
          originX: "center",
          originY: "center",
          fontFamily: textFamily,
          fontSize: clamp(btnH * 0.36, 12, 16),
          fill: preset?.color?.onPrimary ?? "#fff",
          selectable: false,
          evented: false,
        } as any)
        addObj(txt)
        continue
      }

      // FEATURE GRID: container filled with 3 cards (useful when sketch is just one big "content" box)
      if (semantic === "feature_grid") {
        const innerGap = clamp(Math.min(safeWidth, safeHeight) * 0.04, 10, 18)
        const isWide = safeWidth >= safeHeight * 1.15
        const cols = isWide ? 3 : 1
        const rows = isWide ? 1 : 3
        const cardW = (safeWidth - innerGap * (cols - 1)) / cols
        const cardH = (safeHeight - innerGap * (rows - 1)) / rows

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = left + c * (cardW + innerGap)
            const cy = top + r * (cardH + innerGap)
            const card = new fabric.Rect({
              left: cx,
              top: cy,
              width: Math.max(1, cardW),
              height: Math.max(1, cardH),
              fill: preset?.color?.card ?? "#ffffff",
              stroke: preset?.color?.border ?? "#e5e7eb",
              strokeWidth: 1,
              rx: clamp(cardRadius, 12, 22),
              ry: clamp(cardRadius, 12, 22),
              shadow: preset?.shadow?.sm ?? preset?.shadow?.md,
            })
            addObj(card)
            addPill({
              x: cx + pad,
              y: cy + pad,
              w: Math.max(40, Math.min(cardW - pad * 2, cardW * 0.6)),
              h: clamp(cardH * 0.08, 10, 14),
            })
            addPill({
              x: cx + pad,
              y: cy + pad + clamp(cardH * 0.12, 16, 22),
              w: Math.max(40, Math.min(cardW - pad * 2, cardW * 0.8)),
              h: clamp(cardH * 0.06, 8, 12),
            })
          }
        }
        continue
      }

      // PRICING: container filled with 3 pricing cards (headline + price + button)
      if (semantic === "pricing") {
        const innerGap = clamp(Math.min(safeWidth, safeHeight) * 0.04, 10, 18)
        const cols = 3
        const cardW = (safeWidth - innerGap * (cols - 1)) / cols
        const cardH = safeHeight
        for (let c = 0; c < cols; c++) {
          const cx = left + c * (cardW + innerGap)
          const cy = top

          const card = new fabric.Rect({
            left: cx,
            top: cy,
            width: Math.max(1, cardW),
            height: Math.max(1, cardH),
            fill: preset?.color?.card ?? "#ffffff",
            stroke: preset?.color?.border ?? "#e5e7eb",
            strokeWidth: 1,
            rx: clamp(cardRadius, 12, 22),
            ry: clamp(cardRadius, 12, 22),
            shadow: preset?.shadow?.sm ?? preset?.shadow?.md,
          })

          addObj(card)
          addPill({ x: cx + pad, y: cy + pad, w: cardW * 0.5, h: clamp(cardH * 0.06, 10, 14) })
          addPill({ x: cx + pad, y: cy + pad + 22, w: cardW * 0.35, h: clamp(cardH * 0.06, 10, 14) })
          const btnH = clamp(cardH * 0.12, 32, 44)
          const btnW = Math.min(cardW - pad * 2, clamp(cardW * 0.7, 90, 180))

          const btn = new fabric.Rect({
            left: cx + pad,
            top: cy + cardH - pad - btnH,
            width: btnW,
            height: btnH,
            fill: preset?.color?.primary ?? "#4f46e5",
            rx: 999,
            ry: 999,
            selectable: false,
            evented: false,
          })

          addObj(btn)
        }
        continue
      }

      // FAQ: stacked accordion rows (question pill + chevron dot)
      if (semantic === "faq") {
        const rowH = clamp(Math.min(safeWidth, safeHeight) * 0.14, 42, 64)
        const rowGap = clamp(rowH * 0.25, 10, 16)
        let y = top + pad
        let i = 0
        while (y + rowH <= top + safeHeight - pad && i < 6) {
          const row = new fabric.Rect({
            left: left + pad,
            top: y,
            width: Math.max(1, safeWidth - pad * 2),
            height: rowH,
            fill: preset?.color?.card ?? "#ffffff",
            stroke: preset?.color?.border ?? "#e5e7eb",
            strokeWidth: 1,
            rx: clamp(cardRadius, 12, 18),
            ry: clamp(cardRadius, 12, 18),
            selectable: false,
            evented: false,
          })
          addObj(row)
          addPill({ x: row.left! + pad, y: y + rowH * 0.3, w: row.width! * 0.6, h: clamp(rowH * 0.18, 10, 14) })
          const dot = new fabric.Circle({
            left: row.left! + row.width! - pad * 1.2,
            top: y + rowH / 2,
            radius: clamp(rowH * 0.08, 3, 5),
            originX: "center",
            originY: "center",
            fill: preset?.color?.neutral300 ?? "#cbd5e1",
            selectable: false,
            evented: false,
          })
          addObj(dot)
          y += rowH + rowGap
          i++
        }
        continue
      }

      // TESTIMONIAL: quote card (avatar + lines)
      if (semantic === "testimonial") {
        const card = new fabric.Rect({
          left,
          top,
          width: safeWidth,
          height: safeHeight,
          fill: preset?.color?.card ?? "#ffffff",
          stroke: preset?.color?.border ?? "#e5e7eb",
          strokeWidth: 1,
          rx: cardRadius,
          ry: cardRadius,
          shadow: preset?.shadow?.sm ?? preset?.shadow?.md,
        })
        addObj(card)
        const avatarR = clamp(Math.min(safeWidth, safeHeight) * 0.08, 10, 16)
        const avatar = new fabric.Circle({
          left: left + pad + avatarR,
          top: top + pad + avatarR,
          radius: avatarR,
          originX: "center",
          originY: "center",
          fill: preset?.color?.neutral200 ?? "#e2e8f0",
          selectable: false,
          evented: false,
        })
        addObj(avatar)
        addPill({ x: left + pad + avatarR * 2 + 10, y: top + pad + avatarR * 0.3, w: safeWidth * 0.35, h: clamp(avatarR * 0.7, 10, 14) })
        addPill({ x: left + pad, y: top + pad + avatarR * 2 + 14, w: safeWidth - pad * 2, h: clamp(safeHeight * 0.06, 10, 14) })
        addPill({ x: left + pad, y: top + pad + avatarR * 2 + 34, w: safeWidth * 0.8, h: clamp(safeHeight * 0.06, 10, 14) })
        continue
      }

      // MEDIA: device/screenshot frame placeholder (no title pills)
      if (semantic === "media") {
        const chromeH = clamp(safeHeight * 0.1, 18, 28)
        const media = new fabric.Rect({
          left,
          top,
          width: safeWidth,
          height: safeHeight,
          fill: preset?.color?.card ?? "#ffffff",
          stroke: preset?.color?.border ?? "#e5e7eb",
          strokeWidth: 1,
          rx: cardRadius,
          ry: cardRadius,
          shadow: preset?.shadow?.sm ?? preset?.shadow?.md,
        })
        addObj(media)

        // "Window chrome" bar
        const chrome = new fabric.Rect({
          left: left + 1,
          top: top + 1,
          width: Math.max(1, safeWidth - 2),
          height: chromeH,
          fill: preset?.color?.neutral100 ?? "#f1f5f9",
          rx: cardRadius,
          ry: cardRadius,
          selectable: false,
          evented: false,
        })
        addObj(chrome)

        // Window control dots
        const dotR = clamp(chromeH * 0.14, 2.5, 4)
        const dotY = top + chromeH / 2
        const dotX0 = left + pad
        const dotGap = clamp(dotR * 2.6, 8, 12)
          ;[0, 1, 2].forEach((idx) => {
            const c = new fabric.Circle({
              left: dotX0 + idx * dotGap,
              top: dotY,
              radius: dotR,
              originX: "center",
              originY: "center",
              fill: preset?.color?.neutral300 ?? "#cbd5e1",
              selectable: false,
              evented: false,
            })
            addObj(c)
          })

        // Screen area placeholder
        const screen = new fabric.Rect({
          left: left + pad,
          top: top + chromeH + pad * 0.6,
          width: Math.max(1, safeWidth - pad * 2),
          height: Math.max(1, safeHeight - chromeH - pad * 1.2),
          fill: preset?.color?.neutral100 ?? "#f1f5f9",
          stroke: preset?.color?.border ?? "#e5e7eb",
          strokeWidth: 1,
          rx: clamp(cardRadius * 0.8, 10, cardRadius),
          ry: clamp(cardRadius * 0.8, 10, cardRadius),
          selectable: false,
          evented: false,
        })
        addObj(screen)
        continue
      }

      // HERO TEXT: card container + title/body/buttons skeleton
      if (semantic === "hero_text") {
        const card = new fabric.Rect({
          left,
          top,
          width: safeWidth,
          height: safeHeight,
          fill: preset?.color?.card ?? "#ffffff",
          stroke: preset?.color?.border ?? "#e5e7eb",
          strokeWidth: 1,
          rx: cardRadius,
          ry: cardRadius,
          shadow: preset?.shadow?.md,
        })
        addObj(card)

        const contentX = left + pad
        const contentW = Math.max(1, safeWidth - pad * 2)

        const titleSize = clamp(safeWidth * 0.095, 22, 52)
        const subSize = clamp(safeWidth * 0.04, 13, 20)

        const title = addText({
          x: contentX,
          y: top + pad,
          w: contentW,
          text: "Turn sketches into modern layouts.",
          size: titleSize,
          weight: 800,
          fill: preset?.color?.textPrimary ?? "#0f172a",
          lh: 1.05,
        })

        const gap1 = clamp(titleSize * 0.28, 8, 16)
        const subY = (title.top ?? top + pad) + (title.height ?? titleSize * 1.2) + gap1

        const sub = addText({
          x: contentX,
          y: subY,
          w: contentW,
          text: "Draw a rough layout, then let AI fill it with clean typography, spacing, and components — without changing your structure.",
          size: subSize,
          weight: 500,
          fill: preset?.color?.textMuted ?? "#475569",
          lh: 1.35,
        })

        const gap2 = clamp(subSize * 1.2, 10, 18)
        const btnY = (sub.top ?? subY) + (sub.height ?? subSize * 2.2) + gap2

        const btnH = Math.min(
          safeHeight - (btnY - top) - pad,
          clamp(titleSize * 1.05, 34, 46)
        )

        if (btnH >= 28) {
          const btnGap = clamp(btnH * 0.35, 8, 14)
          const primaryW = Math.min(contentW, clamp(contentW * 0.38, 120, 220))
          const secondaryW = Math.min(contentW, clamp(contentW * 0.28, 96, 180))
          const totalInline = primaryW + btnGap + secondaryW

          const primaryX = contentX
          const primaryBtn = new fabric.Rect({
            left: primaryX,
            top: btnY,
            width: totalInline <= contentW ? primaryW : Math.min(contentW, clamp(contentW * 0.55, 140, 260)),
            height: btnH,
            fill: preset?.color?.primary ?? "#4f46e5",
            rx: 999,
            ry: 999,
            shadow: preset?.shadow?.sm ?? preset?.shadow?.md,
            selectable: false,
            evented: false,
          })
          addObj(primaryBtn)
          addText({
            x: primaryBtn.left!,
            y: btnY + btnH * 0.22,
            w: primaryBtn.width!,
            text: "Get started",
            size: clamp(btnH * 0.42, 12, 16),
            weight: 700,
            fill: preset?.color?.onPrimary ?? "#ffffff",
            lh: 1.0,
          })

          // Secondary CTA: outline/ghost button
          const secondaryY = totalInline <= contentW ? btnY : btnY + btnH + btnGap
          const secondaryX = totalInline <= contentW ? primaryX + primaryBtn.width! + btnGap : contentX
          const secondaryBtn = new fabric.Rect({
            left: secondaryX,
            top: secondaryY,
            width: totalInline <= contentW ? secondaryW : Math.min(contentW, clamp(contentW * 0.45, 120, 220)),
            height: btnH,
            fill: preset?.color?.card ?? "#ffffff",
            stroke: preset?.color?.border ?? "#e5e7eb",
            strokeWidth: 1,
            rx: 999,
            ry: 999,
            selectable: false,
            evented: false,
          })
          addObj(secondaryBtn)
          addText({
            x: secondaryBtn.left!,
            y: secondaryY + btnH * 0.22,
            w: secondaryBtn.width!,
            text: "Learn more",
            size: clamp(btnH * 0.42, 12, 16),
            weight: 650,
            fill: preset?.color?.textPrimary ?? "#0f172a",
            lh: 1.0,
          })
        }
        continue
      }

      // DEFAULT: keep the existing card + layoutCard skeleton
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
      addObj(card)

      const laidOutBlocks = layoutCard(el.blocks, safeWidth)
      laidOutBlocks.forEach((block) => {
        const obj = renderSemanticBlock({
          ...block,
          left: left + block.left,
          top: top + block.top,
          theme: blockTheme,
        })
        addObj(obj)
      })
    }

    // Frames are background artboards (solid fill). Keep them behind generated UI.
    canvas.sendObjectToBack(frame)
  }

  canvas.requestRenderAll()

}
