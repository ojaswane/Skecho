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

type LayoutContext = {
    cursorX: number
    cursorY: number
    frameX: number
    frameY: number
    frameWidth: number
    frameHeight: number
}

/* ---------------- CONSTANTS ---------------- */

const CANVAS_PADDING = 40
const MAX_WIDTH = 1440
const MAX_HEIGHT = 1024

/* ---------------- HELPERS ---------------- */

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(v, max))
}

function createLayoutContext(
    x: number,
    y: number,
    width: number,
    height: number
): LayoutContext {
    return {
        frameX: x,
        frameY: y,
        frameWidth: width - Tokens.spacing.lg * 2,
        frameHeight: height - Tokens.spacing.lg * 2,
        cursorX: x + Tokens.spacing.lg,
        cursorY: y + Tokens.spacing.lg,
    }
}

function measureHeight(e: Element): number {
    switch (e.type) {
        case "text":
            return Tokens.typography.scale.hero.lineHeight
        case "card":
            return 160
        case "input":
            return Tokens.size.inputHeight
        case "button":
            return Tokens.size.buttonHeight
        case "image":
            return e.width ?? 96
        default:
            return 0
    }
}

function canFit(layout: LayoutContext, h: number) {
    const bottom =
        layout.frameY +
        layout.frameHeight +
        Tokens.spacing.lg

    return layout.cursorY + h <= bottom
}

/* ---------------- RENDER ---------------- */

const render = (canvas: fabric.Canvas, elements: Element[]) => {
    if (!canvas || !elements?.length) return


    let activeLayout: LayoutContext | null = null

    for (const e of elements) {
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

            const frame = new fabric.Rect({
                left: x,
                top: y,
                width: frameWidth,
                height: frameHeight,
                rx: Tokens.radius.md,
                ry: Tokens.radius.md,
                fill: Tokens.color.backgroundMuted,
                stroke: Tokens.color.border,
                strokeWidth: 1,
                selectable: false,
            })

            activeLayout = createLayoutContext(
                x,
                y,
                frameWidth,
                frameHeight
            )

            canvas.add(frame)
            continue
        }

        if (!activeLayout) continue

        const h = measureHeight(e)
        if (!canFit(activeLayout, h)) continue

        /* ---------------- TEXT ---------------- */
        if (e.type === "text") {
            const text = new fabric.Textbox(e.text ?? "Heading", {
                left: activeLayout.cursorX,
                top: activeLayout.cursorY,
                width: activeLayout.frameWidth,
                fontSize: Tokens.typography.scale.hero.size,
                lineHeight:
                    Tokens.typography.scale.hero.lineHeight /
                    Tokens.typography.scale.hero.size,
                fontWeight: Tokens.typography.scale.hero.weight,
                fill: Tokens.color.textPrimary,
                selectable: false,
            })

            activeLayout.cursorY +=
                Tokens.typography.scale.hero.lineHeight +
                Tokens.spacing.md

            canvas.add(text)
            continue
        }

        /* ---------------- CARD ---------------- */
        if (e.type === "card") {
            const rect = new fabric.Rect({
                left: activeLayout.cursorX,
                top: activeLayout.cursorY,
                width: activeLayout.frameWidth,
                height: 160,
                rx: Tokens.radius.lg,
                ry: Tokens.radius.lg,
                fill: Tokens.color.card,
                stroke: Tokens.color.border,
                shadow: new fabric.Shadow({
                    color: "rgba(0,0,0,0.12)",
                    blur: 10,
                    offsetY: 4,
                }),
                selectable: false,
            })

            const text = new fabric.Textbox(e.text ?? "Card title", {
                left: activeLayout.cursorX + Tokens.spacing.md,
                top: activeLayout.cursorY + Tokens.spacing.md,
                width:
                    activeLayout.frameWidth -
                    Tokens.spacing.md * 2,
                fontSize: Tokens.typography.scale.body.size,
                lineHeight:
                    Tokens.typography.scale.body.lineHeight /
                    Tokens.typography.scale.body.size,
                fill: Tokens.color.textMuted,
                selectable: false,
            })

            activeLayout.cursorY +=
                160 + Tokens.spacing.lg

            canvas.add(rect, text)
            continue
        }

        /* ---------------- INPUT ---------------- */
        if (e.type === "input") {
            const rect = new fabric.Rect({
                left: activeLayout.cursorX,
                top: activeLayout.cursorY,
                width: activeLayout.frameWidth,
                height: Tokens.size.inputHeight,
                rx: Tokens.radius.sm,
                ry: Tokens.radius.sm,
                fill: Tokens.color.surface,
                stroke: Tokens.color.borderStrong,
                selectable: false,
            })

            const text = new fabric.Text("Placeholder", {
                left: activeLayout.cursorX + Tokens.spacing.sm,
                top:
                    activeLayout.cursorY +
                    Tokens.size.inputHeight / 2,
                originY: "center",
                fontSize: Tokens.typography.scale.body.size,
                fill: Tokens.color.textMuted,
                selectable: false,
            })

            activeLayout.cursorY +=
                Tokens.size.inputHeight +
                Tokens.spacing.md

            canvas.add(rect, text)
            continue
        }

        /* ---------------- BUTTON ---------------- */
        if (e.type === "button") {
            const rect = new fabric.Rect({
                left: activeLayout.cursorX,
                top: activeLayout.cursorY,
                width: activeLayout.frameWidth,
                height: Tokens.size.buttonHeight,
                rx: Tokens.radius.sm,
                ry: Tokens.radius.sm,
                fill: Tokens.color.primary,
                selectable: false,
            })

            const text = new fabric.Text(e.text ?? "Action", {
                left:
                    activeLayout.cursorX +
                    activeLayout.frameWidth / 2,
                top:
                    activeLayout.cursorY +
                    Tokens.size.buttonHeight / 2,
                originX: "center",
                originY: "center",
                fontSize: Tokens.typography.scale.body.size,
                fill: Tokens.color.onPrimary,
                selectable: false,
            })

            activeLayout.cursorY +=
                Tokens.size.buttonHeight +
                Tokens.spacing.lg

            canvas.add(rect, text)
            continue
        }
    }

    canvas.requestRenderAll()
}

export default render
