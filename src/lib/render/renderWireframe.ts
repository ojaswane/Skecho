import * as fabric from "fabric"
import { Tokens } from "@/tokens/Tokens"

/* ---------------- TYPES ---------------- */

type Element = {
    type: "frame" | "card" | "text" | "button" | "input" | "image"
    x?: number
    y?: number
    width?: number
    height?: number
    text?: string
    data?: any
}

type LayoutMode = "stack" | "grid"

type LayoutContext = {
    mode: LayoutMode
    cursorX: number
    cursorY: number
    frameX: number
    frameY: number
    frameWidth: number
}

/* ---------------- LAYOUT CONTEXT ---------------- */

function createLayoutContext(
    x: number,
    y: number,
    width: number
): LayoutContext {
    return {
        mode: "stack",
        frameX: x,
        frameY: y,
        cursorX: x + Tokens.spacing.lg,
        cursorY: y + Tokens.spacing.lg,
        frameWidth: width - Tokens.spacing.lg * 2,
    }
}

/* ---------------- CONSTANTS ---------------- */

const CANVAS_PADDING = 40
const MAX_WIDTH = 1440
const MAX_HEIGHT = 1024

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max))
}

/* ---------------- HELPERS ---------------- */

function getLastFrame(canvas: fabric.Canvas) {
    return canvas
        .getObjects()
        .filter((o: any) => o.__isFrame)
        .slice(-1)[0] as any
}

/* ---------------- RENDER ---------------- */

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
            const frameHeight = e.height ?? 520

            const frame = new fabric.Rect({
                left: x,
                top: y,
                width: frameWidth,
                height: frameHeight,
                fill: Tokens.color.surface,
                stroke: Tokens.color.border,
                strokeWidth: 1,
                rx: Tokens.radius.md,
                ry: Tokens.radius.md,
                selectable: false,
            })

                ; (frame as any).__isFrame = true
                ; (frame as any).layout = createLayoutContext(x, y, frameWidth)

            canvas.add(frame)
            return
        }

        const frame = getLastFrame(canvas)
        const layout = frame?.layout
        if (!layout) return

        /* ---------------- TEXT ---------------- */
        if (e.type === "text") {
            const text = new fabric.Textbox(e.text || "Heading", {
                left: layout.cursorX,
                top: layout.cursorY,
                width: layout.frameWidth,
                fontSize: Tokens.typography.scale.hero.size,
                fontWeight: Tokens.typography.scale.hero.weight,
                fill: Tokens.color.textPrimary,
                selectable: false,
            })

            layout.cursorY +=
                Tokens.typography.scale.hero.lineHeight + Tokens.spacing.md

            canvas.add(text)
            return
        }

        /* ---------------- CARD ---------------- */
        if (e.type === "card") {
            const height = 160

            const card = new fabric.Rect({
                left: layout.cursorX,
                top: layout.cursorY,
                width: layout.frameWidth,
                height,
                rx: Tokens.radius.lg,
                ry: Tokens.radius.lg,
                fill: Tokens.color.card,
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
                width: layout.frameWidth - Tokens.spacing.md * 2,
                fontSize: Tokens.typography.scale.body.size,
                fill: Tokens.color.textMuted,
                selectable: false,
            })

            layout.cursorY += height + Tokens.spacing.lg

            canvas.add(card, text)
            return
        }

        /* ---------------- IMAGE (AVATAR) ---------------- */
        if (e.type === "image") {
            const size = e.width ?? 64

            const avatar = new fabric.Circle({
                left: layout.cursorX,
                top: layout.cursorY,
                radius: size / 2,
                fill: Tokens.color.primary,
            })

            layout.cursorY += size + Tokens.spacing.md

            canvas.add(avatar)
            return
        }

        /* ---------------- INPUT ---------------- */
        if (e.type === "input") {
            const width = e.width ?? layout.frameWidth
            const height = Tokens.size.inputHeight

            const rect = new fabric.Rect({
                left: layout.cursorX,
                top: layout.cursorY,
                width,
                height,
                rx: Tokens.radius.sm,
                ry: Tokens.radius.sm,
                fill: Tokens.color.surface,
                stroke: Tokens.color.borderStrong,
            })

            const text = new fabric.Text(e.text || "Placeholder", {
                left: layout.cursorX + Tokens.spacing.sm,
                top: layout.cursorY + height / 2 - 7,
                fontSize: Tokens.typography.scale.body.size,
                fill: Tokens.color.textMuted,
                selectable: false,
            })

            layout.cursorY += height + Tokens.spacing.md

            canvas.add(rect, text)
            return
        }

        /* ---------------- BUTTON ---------------- */
        if (e.type === "button") {
            const width = e.width ?? 200
            const height = Tokens.size.buttonHeight

            const rect = new fabric.Rect({
                left: layout.cursorX,
                top: layout.cursorY,
                width,
                height,
                rx: Tokens.radius.sm,
                ry: Tokens.radius.sm,
                fill: Tokens.color.primary,
            })

            const text = new fabric.Text(e.text || "Action", {
                left: layout.cursorX + width / 2,
                top: layout.cursorY + height / 2,
                originX: "center",
                originY: "center",
                fontSize: Tokens.typography.scale.body.size,
                fill: Tokens.color.onPrimary,
                selectable: false,
            })

            layout.cursorY += height + Tokens.spacing.md

            canvas.add(rect, text)
            return
        }
    })

    canvas.requestRenderAll()
}

export default render
