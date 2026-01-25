import * as fabric from "fabric"
import { Tokens } from "@/tokens/Tokens";


type Element = {
    type: "frame" | "card" | "text" | "button" | "input" | "image"
    x?: number
    y?: number
    width?: number
    height?: number
    text?: string
    data?: any
}

type LayoutContext = {
    cursorX: number
    cursorY: number
    frameWidth: number
}

function createLayoutContext(x: number, y: number, width: number) {
    return {
        cursorX: x + Tokens.spacing.lg,
        cursorY: y + Tokens.spacing.lg,
        frameWidth: width - Tokens.spacing.lg * 2,
    }
}


/* ---------------- GRID / SAFETY ---------------- */
const CANVAS_PADDING = 40
const MIN_GAP = Tokens.spacing.lg // 24
const MAX_WIDTH = 1440
const MAX_HEIGHT = 1024

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max))
}

const render = (canvas: fabric.Canvas, elements: Element[]) => {
    if (!canvas || !elements?.length) return

    elements.forEach((e) => {
        const x = clamp(
            e.x ?? CANVAS_PADDING,
            CANVAS_PADDING,
            MAX_WIDTH - CANVAS_PADDING
        )

        const y = clamp(
            e.y ?? CANVAS_PADDING,
            CANVAS_PADDING,
            MAX_HEIGHT - CANVAS_PADDING
        )

        /* ---------------- FRAME ---------------- */
        if (e.type === "frame") {
            const frameWidth = e.width ?? 360
            const frameHeight = e.height ?? 480

            const rect = new fabric.Rect({
                left: x,
                top: y,
                width: frameWidth,
                height: frameHeight,
                fill: "#f3f4f6", // light gray
                stroke: Tokens.color.border,
                strokeWidth: 1,
                rx: Tokens.radius.md,
                ry: Tokens.radius.md,
            })

                ; (rect as any).layout = createLayoutContext(x, y, frameWidth)

            canvas.add(rect)
        }

        /* ---------------- CARD ---------------- */
        if (e.type === "card") {
            const parentFrame = canvas.getObjects("rect").slice(-1)[0] as any
            const layout = parentFrame?.layout

            if (!layout) return

            const width = layout.frameWidth
            const height = 160

            const rect = new fabric.Rect({
                left: layout.cursorX,
                top: layout.cursorY,
                width,
                height,
                rx: Tokens.radius.lg,
                ry: Tokens.radius.lg,
                fill: "#ffffff",
                stroke: Tokens.color.border,
                shadow: new fabric.Shadow({
                    color: "rgba(0,0,0,0.08)",
                    blur: 12,
                    offsetY: 4,
                }),
            })

            const text = new fabric.Textbox(e.text || "Card title", {
                left: layout.cursorX + Tokens.spacing.md,
                top: layout.cursorY + Tokens.spacing.md,
                width: width - Tokens.spacing.md * 2,
                fontSize: Tokens.typography.scale.body.size,
                fill: Tokens.color.textMuted,
            })

            layout.cursorY += height + Tokens.spacing.lg

            canvas.add(rect, text)
        }

        /* ---------------- TEXT ---------------- */
        if (e.type === "text") {
            const parentFrame = canvas.getObjects("rect").slice(-1)[0] as any
            const layout = parentFrame?.layout
            if (!layout) return

            const text = new fabric.Textbox(e.text || "Heading", {
                left: layout.cursorX,
                top: layout.cursorY,
                width: layout.frameWidth,
                fontSize: Tokens.typography.scale.hero.size,
                fontWeight: Tokens.typography.scale.body.weight,
                fill: Tokens.color.textPrimary,
            })

            layout.cursorY += Tokens.typography.scale.body.lineHeight + Tokens.spacing.md

            canvas.add(text)
        }

        /* ---------------- IMAGE / AVATAR ---------------- */
        if (e.type === "image") {
            const size = e.width ?? 96

            const circle = new fabric.Circle({
                left: x,
                top: y,
                radius: size / 2,
                fill: Tokens.color.primary,
                selectable: true,
            })

                ; (circle as any).data = e.data
            canvas.add(circle)
        }

        /* ---------------- INPUT ---------------- */
        if (e.type === "input") {
            const width = e.width ?? 320
            const height = Tokens.size.inputHeight

            const rect = new fabric.Rect({
                left: x,
                top: y,
                width,
                height,
                rx: Tokens.radius.sm,
                ry: Tokens.radius.sm,
                fill: Tokens.color.surface,
                stroke: Tokens.color.borderStrong,
                strokeWidth: 1,
                selectable: true,
            })

            const text = new fabric.Text(e.text || "Placeholder", {
                left: x + Tokens.spacing.sm,
                top: y + height / 2 - 7,
                fontSize: Tokens.typography.scale.body.size,
                fill: Tokens.color.textMuted,
                selectable: false,
            })

                ; (rect as any).data = e.data
                ; (text as any).data = e.data

            canvas.add(rect, text)
        }

        /* ---------------- BUTTON ---------------- */
        if (e.type === "button") {
            const width = e.width ?? 240
            const height = Tokens.size.buttonHeight

            const rect = new fabric.Rect({
                left: x,
                top: y,
                width,
                height,
                rx: Tokens.radius.sm,
                ry: Tokens.radius.sm,
                fill: Tokens.color.primary,
                selectable: true,
            })

            const text = new fabric.Text(e.text || "Action", {
                left: x + width / 2,
                top: y + height / 2,
                originX: "center",
                originY: "center",
                fontSize: Tokens.typography.scale.body.size,
                fill: Tokens.color.onPrimary,
                selectable: false,
            })

                ; (rect as any).data = e.data
                ; (text as any).data = e.data

            canvas.add(rect, text)
        }
    })

    canvas.requestRenderAll()
}

export default render
