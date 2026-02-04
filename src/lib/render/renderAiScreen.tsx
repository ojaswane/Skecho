import { layoutCard } from "../../../backend/src/design-systems/cardLayout/CardLayout"
import { renderSemanticBlock } from "@/lib/render/renderSemanticBlock"
import * as fabric from "fabric"

function renderCardShell(
    frame: fabric.Rect,
    element: any,
    canvas: fabric.Canvas
) {
    const GRID = {
        padding: 48,
        colWidth: 120,
        rowHeight: 96,
        gap: 16,
    }

    
    const left =
        frame.left! +
        GRID.padding +
        (element.col - 1) * (GRID.colWidth + GRID.gap)

    const top =
        frame.top! +
        GRID.padding +
        (element.row - 1) * (GRID.rowHeight + GRID.gap)

    const width =
        element.span * GRID.colWidth +
        (element.span - 1) * GRID.gap

    const height =
        element.rowSpan * GRID.rowHeight +
        (element.rowSpan - 1) * GRID.gap

    const card = new fabric.Rect({
        left,
        top,
        width,
        height,
        rx: 12,
        ry: 12,
        fill: "transparent",
        stroke: "#111",
        strokeWidth: 1.5,
        strokeDashArray: [6, 4],
        selectable: false,
        evented: false,
    })

    card.set("isCard", true)
    card.set("elementId", element.id)
    card.clipPath = frame.clipPath

    canvas.add(card)
    return card
}

export default function renderAIScreens(
    canvas: fabric.Canvas,
    screens: any[]
) {
    for (const screen of screens) {
        const frame = canvas.getObjects().find(
            (o: any) =>
                o.get?.("isFrame") &&
                o.get?.("frameId") === screen.frameId
        ) as fabric.Rect

        if (!frame) continue

        for (const element of screen.elements) {
            const card = renderCardShell(frame, element, canvas)

            if (element.blocks?.length) {
                const laidOut = layoutCard(
                    element.blocks,
                    card.width!
                )

                
                for (const block of laidOut) {
                    const obj = renderSemanticBlock(block)
                    obj.left += card.left!
                    obj.top += card.top!
                    obj.clipPath = frame.clipPath
                    canvas.add(obj)
                }
            }
        }

        canvas.bringObjectToFront(frame)
    }

    canvas.requestRenderAll()
}