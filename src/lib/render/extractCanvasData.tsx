import * as fabric from 'fabric'

const extractCanvasData = (canvas: fabric.Canvas) => {
    if (!canvas) return []

    const objects = canvas.getObjects()

    return objects.map((obj) => {
        const isText =
            obj.type === 'text' ||
            obj.type === 'textbox' ||
            obj.type === 'i-text'

        return {
            type: obj.type,
            left: obj.left ?? 0,
            top: obj.top ?? 0,
            width: obj.width ?? 0,
            height: obj.height ?? 0,
            text: isText ? (obj as fabric.Textbox).text ?? '' : null,
        }
    })
}

export default extractCanvasData
