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
            const rect = new fabric.Rect({
                left: x,
                top: y,
                width: e.width ?? 360,
                height: e.height ?? 280,
                fill: Tokens.color.backgroundMuted,
                stroke: Tokens.color.border,
                strokeWidth: 1,
                rx: Tokens.radius.md,
                ry: Tokens.radius.md,
                selectable: true,
            })

                ; (rect as any).data = e.data
            canvas.add(rect)
        }

        /* ---------------- CARD ---------------- */
        if (e.type === "card") {
            const width = Math.max(
                e.width ?? Tokens.size.cardMinWidth,
                Tokens.size.cardMinWidth
            )

            const height = e.height ?? 160

            const rect = new fabric.Rect({
                left: x,
                top: y,
                width,
                height,
                rx: Tokens.radius.lg,
                ry: Tokens.radius.lg,
                fill: Tokens.color.surface,
                stroke: Tokens.color.border,
                strokeWidth: 1,
                selectable: true,
                shadow: new fabric.Shadow({
                    color: "rgba(0,0,0,0.08)",
                    blur: 12,
                    offsetX: 0,
                    offsetY: 4,
                }),
            })

            const text = new fabric.Textbox(e.text || "Card title", {
                left: x + Tokens.spacing.md,
                top: y + Tokens.spacing.md,
                width: width - Tokens.spacing.md * 2,
                fontSize: Tokens.typography.scale.body.size,
                lineHeight: Tokens.typography.scale.body.lineHeight / Tokens.typography.scale.body.size,
                fill: Tokens.color.textPrimary,
                selectable: false,
            })

                ; (rect as any).data = e.data
                ; (text as any).data = e.data

            canvas.add(rect, text)
        }

        /* ---------------- TEXT ---------------- */
        if (e.type === "text") {
            const text = new fabric.Textbox(e.text || "Heading", {
                left: x,
                top: y,
                width: e.width ?? 420,
                fontSize: Tokens.typography.scale.hero.size,
                fontWeight: Tokens.typography.scale.hero.weight,
                lineHeight:
                    Tokens.typography.scale.hero.lineHeight /
                    Tokens.typography.scale.hero.size,
                fill: Tokens.color.textPrimary,
                selectable: true,
            })

                ; (text as any).data = e.data
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
