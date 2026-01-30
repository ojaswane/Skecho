import * as fabric from "fabric"

export function addObjectToFrame(
    frame: fabric.Group,
    obj: fabric.Object,
    canvas: fabric.Canvas
) {
    const frameLeft = frame.left ?? 0
    const frameTop = frame.top ?? 0

    obj.left = (obj.left ?? 0) - frameLeft
    obj.top = (obj.top ?? 0) - frameTop

    frame.add(obj)

    canvas.requestRenderAll()
}
