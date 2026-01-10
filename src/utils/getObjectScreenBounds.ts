import * as fabric from 'fabric'

export function getObjectScreenBounds(
    canvas: fabric.Canvas,
    obj: fabric.Object
) {
    obj.setCoords()

    const rect = obj.getBoundingRect()
    const vpt = canvas.viewportTransform

    if (!vpt) {
        return {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        }
    }

    const left = rect.left * vpt[0] + vpt[4]
    const top = rect.top * vpt[3] + vpt[5]

    return {
        left,
        top,
        width: rect.width * vpt[0],
        height: rect.height * vpt[3],
    }
}
