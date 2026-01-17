import * as fabric from 'fabric'

const extractCanvasData = (canvas: fabric.Canvas) => {
    if (!canvas) return []

    const object = canvas.getObjects()

    return object.map((obj) => ({
        type: obj.type,
        left: obj.left ?? 0,
        top: obj.top ?? 0,
        width: obj.width ?? 0,
        height: obj.height ?? 0,
        text: Text ? (obj as fabric.Textbox).text ?? '' : null,
    }))
}

export default extractCanvasData