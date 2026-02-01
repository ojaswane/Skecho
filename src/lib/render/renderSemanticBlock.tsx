import * as fabric from "fabric"
import type { LaidOutBlock } from "../../../lib/store/canvasStore"

export function renderSemanticBlock(
    canvas: fabric.Canvas,
    block: LaidOutBlock
) {
    const { left, top, width, height, rule } = block

    let object: fabric.Object | null = null

    /* ---------------- SHAPES ---------------- */

    if (rule.shape === "pill") {
        object = new fabric.Rect({
            left,
            top,
            width,
            height,
            rx: height / 2,
            ry: height / 2,
            fill: "#e5e7eb",
            selectable: false
        })
    }

    if (rule.shape === "rect") {
        object = new fabric.Rect({
            left,
            top,
            width,
            height,
            rx: 8,
            ry: 8,
            fill: "#e5e7eb",
            selectable: false
        })
    }

    if (rule.shape === "circle") {
        const size = Math.min(width, height)

        object = new fabric.Circle({
            left,
            top,
            radius: size / 2,
            fill: "#e5e7eb",
            selectable: false
        })
    }

    if (!object) return

    /* ---------------- ICON PLACEHOLDER ---------------- */

    if (rule.Icon) {
        const iconSize = Math.min(width, height) * 0.45

        const icon = new fabric.Text("◎", {
            left: left + width / 2,
            top: top + height / 2,
            fontSize: iconSize,
            fill: "#9ca3af",
            originX: "center",
            originY: "center",
            selectable: false
        })

        canvas.add(object, icon)
        return
    }

    canvas.add(object)
}
