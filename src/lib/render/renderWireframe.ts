import * as fabric from "fabric"
import { Tokens } from "@/tokens/Tokens"

/* ---------------- TYPES ---------------- */

type ElementType =
    | "frame"
    | "card"
    | "text"
    | "button"
    | "input"
    | "image"

export type Element = {
    type: ElementType
    width?: number
    height?: number

    // GRID BASED
    col?: number
    span?: number
    rowSpan?: number

    text?: string
}

/* ---------------- GRID ---------------- */

type GridConfig = {
    columns: number
    gutter: number
    margin: number
    rowHeight: number
}

const DESKTOP_GRID: GridConfig = {
    columns: 12,
    gutter: 24,
    margin: 32,
    rowHeight: 88,
}

type GridContext = {
    frameX: number
    frameY: number
    frameWidth: number
    colWidth: number
    grid: GridConfig
    currentRow: number
}

/* ---------------- HELPERS ---------------- */

function createGridContext(
    x: number,
    y: number,
    width: number,
    grid: GridConfig
): GridContext {
    const usableWidth = width - grid.margin * 2

    const colWidth =
        (usableWidth -
            grid.gutter * (grid.columns - 1)) /
        grid.columns

    return {
        frameX: x + grid.margin,
        frameY: y + grid.margin,
        frameWidth: usableWidth,
        colWidth,
        grid,
        currentRow: 0,
    }
}

function gridToPixel(
    ctx: GridContext,
    col: number,
    span: number,
    rowSpan = 1
) {
    const left =
        ctx.frameX +
        col * (ctx.colWidth + ctx.grid.gutter)

    const top =
        ctx.frameY +
        ctx.currentRow * ctx.grid.rowHeight

    const width =
        span * ctx.colWidth +
        (span - 1) * ctx.grid.gutter

    const height = rowSpan * ctx.grid.rowHeight

    return { left, top, width, height }
}

/* ---------------- RENDER ---------------- */

const renderGridLayout = (
    canvas: fabric.Canvas,
    elements: Element[]
) => {
    if (!canvas || !elements.length) return

    canvas.clear()

    let gridCtx: GridContext | null = null

    for (const e of elements) {
        /* -------- FRAME -------- */
        if (e.type === "frame") {
            const x = 40
            const y = 40
            const width = e.width ?? 1200
            const height = e.height ?? 800

            const frame = new fabric.Rect({
                left: x,
                top: y,
                width,
                height,
                rx: Tokens.radius.md,
                ry: Tokens.radius.md,
                fill: Tokens.color.backgroundMuted,
                stroke: Tokens.color.border,
                strokeWidth: 1,
                selectable: false,
            })

            canvas.add(frame)

            gridCtx = createGridContext(
                x,
                y,
                width,
                DESKTOP_GRID
            )

            continue
        }

        if (!gridCtx) continue

        const col = e.col ?? 0
        const span = e.span ?? 12
        const rowSpan = e.rowSpan ?? 1

        const box = gridToPixel(
            gridCtx,
            col,
            span,
            rowSpan
        )

        /* -------- TEXT -------- */
        if (e.type === "text") {
            const text = new fabric.Textbox(
                e.text ?? "Heading",
                {
                    left: box.left,
                    top: box.top,
                    width: box.width,
                    fontSize:
                        Tokens.typography.scale.hero.size,
                    lineHeight:
                        Tokens.typography.scale.hero
                            .lineHeight /
                        Tokens.typography.scale.hero.size,
                    fontWeight:
                        Tokens.typography.scale.hero.weight,
                    fill: Tokens.color.textPrimary,
                    selectable: false,
                }
            )

            canvas.add(text)
            gridCtx.currentRow += rowSpan
            continue
        }

        /* -------- CARD -------- */
        if (e.type === "card") {
            const card = new fabric.Rect({
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                rx: Tokens.radius.lg,
                ry: Tokens.radius.lg,
                fill: Tokens.color.card,
                stroke: Tokens.color.border,
                selectable: false,
                shadow: new fabric.Shadow({
                    color: "rgba(0,0,0,0.12)",
                    blur: 12,
                    offsetY: 4,
                }),
            })

            const title = new fabric.Textbox(
                e.text ?? "Card title",
                {
                    left: box.left + Tokens.spacing.md,
                    top: box.top + Tokens.spacing.md,
                    width:
                        box.width -
                        Tokens.spacing.md * 2,
                    fontSize:
                        Tokens.typography.scale.body.size,
                    fill: Tokens.color.textMuted,
                    selectable: false,
                }
            )

            canvas.add(card, title)
            gridCtx.currentRow += rowSpan
            continue
        }

        /* -------- INPUT -------- */
        if (e.type === "input") {
            const input = new fabric.Rect({
                left: box.left,
                top: box.top,
                width: box.width,
                height: Tokens.size.inputHeight,
                rx: Tokens.radius.sm,
                ry: Tokens.radius.sm,
                fill: Tokens.color.surface,
                stroke: Tokens.color.borderStrong,
                selectable: false,
            })

            const placeholder = new fabric.Text(
                "Placeholder",
                {
                    left:
                        box.left +
                        Tokens.spacing.sm,
                    top:
                        box.top +
                        Tokens.size.inputHeight /
                        2,
                    originY: "center",
                    fontSize:
                        Tokens.typography.scale.body
                            .size,
                    fill: Tokens.color.textMuted,
                    selectable: false,
                }
            )

            canvas.add(input, placeholder)
            gridCtx.currentRow += 1
            continue
        }

        /* -------- BUTTON -------- */
        if (e.type === "button") {
            const button = new fabric.Rect({
                left: box.left,
                top: box.top,
                width: box.width,
                height: Tokens.size.buttonHeight,
                rx: Tokens.radius.sm,
                ry: Tokens.radius.sm,
                fill: Tokens.color.primary,
                selectable: false,
            })

            const label = new fabric.Text(
                e.text ?? "Action",
                {
                    left:
                        box.left +
                        box.width / 2,
                    top:
                        box.top +
                        Tokens.size.buttonHeight /
                        2,
                    originX: "center",
                    originY: "center",
                    fontSize:
                        Tokens.typography.scale.body
                            .size,
                    fill: Tokens.color.onPrimary,
                    selectable: false,
                }
            )

            canvas.add(button, label)
            gridCtx.currentRow += 1
            continue
        }
    }

    canvas.requestRenderAll()
}

export default renderGridLayout
