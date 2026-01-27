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
    col?: number
    row?: number
    span?: number
    rowSpan?: number
    width?: number
    height?: number
    text?: string
    src?: string
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
    colWidth: number
    grid: GridConfig
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
        (usableWidth - grid.gutter * (grid.columns - 1)) /
        grid.columns

    return {
        frameX: x + grid.margin,
        frameY: y + grid.margin,
        colWidth,
        grid,
    }
}

function gridToPixel(
    ctx: GridContext,
    col = 1,
    row = 1,
    span = 12,
    rowSpan = 1
) {
    const left =
        ctx.frameX +
        (col - 1) * (ctx.colWidth + ctx.grid.gutter)

    const top =
        ctx.frameY +
        (row - 1) * (ctx.grid.rowHeight + ctx.grid.gutter)

    const width =
        span * ctx.colWidth +
        (span - 1) * ctx.grid.gutter

    const height =
        rowSpan * ctx.grid.rowHeight +
        (rowSpan - 1) * ctx.grid.gutter

    return { left, top, width, height }
}

/* ---------------- RENDER ---------------- */

const renderGridLayout = (
    canvas: fabric.Canvas,
    elements: Element[]
) => {
    if (!canvas || !elements?.length) return

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
                rx: Tokens.radius.lg,
                ry: Tokens.radius.lg,
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

        const box = gridToPixel(
            gridCtx,
            e.col,
            e.row,
            e.span,
            e.rowSpan
        )

        /* -------- TEXT -------- */
        if (e.type === "text") {
            const text = new fabric.Textbox(
                e.text ?? "Heading",
                {
                    left: box.left,
                    top: box.top,
                    width: box.width,
                    fontSize: 28,
                    fontWeight: 600,
                    fill: Tokens.color.textPrimary,
                    selectable: false,
                }
            )
            canvas.add(text)
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
                    left: box.left + 16,
                    top: box.top + 16,
                    width: box.width - 32,
                    fontSize: 16,
                    fill: Tokens.color.textMuted,
                    selectable: false,
                }
            )

            canvas.add(card, title)
        }

        /* -------- INPUT -------- */
        if (e.type === "input") {
            const input = new fabric.Rect({
                left: box.left,
                top: box.top,
                width: box.width,
                height: 44,
                rx: 8,
                ry: 8,
                fill: Tokens.color.surface,
                stroke: Tokens.color.borderStrong,
                selectable: false,
            })

            const placeholder = new fabric.Text(
                e.text ?? "Placeholder",
                {
                    left: box.left + 12,
                    top: box.top + 22,
                    originY: "center",
                    fontSize: 14,
                    fill: Tokens.color.textMuted,
                    selectable: false,
                }
            )

            canvas.add(input, placeholder)
        }

        /* -------- BUTTON -------- */
        if (e.type === "button") {
            const button = new fabric.Rect({
                left: box.left,
                top: box.top,
                width: box.width,
                height: 44,
                rx: 8,
                ry: 8,
                fill: Tokens.color.primary,
                selectable: false,
            })

            const label = new fabric.Text(
                e.text ?? "Action",
                {
                    left: box.left + box.width / 2,
                    top: box.top + 22,
                    originX: "center",
                    originY: "center",
                    fontSize: 14,
                    fill: Tokens.color.onPrimary,
                    selectable: false,
                }
            )

            canvas.add(button, label)
        }

        /* -------- IMAGE -------- */
        if (e.type === "image") {
            const imgBg = new fabric.Rect({
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                rx: 12,
                ry: 12,
                fill: "#E5E7EB",
                selectable: false,
            })

            const imgText = new fabric.Text(
                "Image",
                {
                    left: box.left + box.width / 2,
                    top: box.top + box.height / 2,
                    originX: "center",
                    originY: "center",
                    fontSize: 14,
                    fill: "#6B7280",
                    selectable: false,
                }
            )

            canvas.add(imgBg, imgText)
        }
    }

    canvas.requestRenderAll()
}

export default renderGridLayout
