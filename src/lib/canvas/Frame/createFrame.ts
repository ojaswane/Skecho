import * as fabric from "fabric"

export function createFrame({
    canvas,
    id,
    left,
    top,
    width,
    height,
    name = "Frame",
}: {
    canvas: fabric.Canvas
    id: string
    left: number
    top: number
    width: number
    height: number
    name?: string
}) {
    /* ---------------- FRAME BORDER ---------------- */
    const border = new fabric.Rect({
        left: 0,
        top: 0,
        width,
        height,
        rx: 12,
        ry: 12,
        fill: "transparent",
        stroke: "#ddd",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
    })

    /* ---------------- CLIP PATH ---------------- */
    const clip = new fabric.Rect({
        left: 0,
        top: 0,
        width,
        height,
        absolutePositioned: false,
    })

    /* ---------------- GROUP (FRAME ITSELF) ---------------- */
    const frame = new fabric.Group([border], {
        left,
        top,
        selectable: true,
        subTargetCheck: true,
        clipPath: clip,
    })

        // custom metadata
        ; (frame as any).frameId = id
        ; (frame as any).type = "frame"
        ; (frame as any).name = name
        ; (frame as any).children = []

    canvas.add(frame)
    canvas.sendObjectToBack(frame)
    canvas.requestRenderAll()

    return frame
}
