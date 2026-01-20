import * as fabric from "fabric"

const renderWireframe = (
    canvas: fabric.Canvas,
    elements: any[]
) => {
    canvas.getObjects().forEach((obj) => {
        if ((obj as any).data?.generated) {
            canvas.remove(obj)
        }
    })

    elements.forEach((e) => {
        let group: fabric.Group | null = null

        if (e.type === "input") {
            const rect = new fabric.Rect({
                width: 260,
                height: 40,
                rx: 6,
                ry: 6,
                fill: "#fff",
                stroke: "#000",
            })

            const text = new fabric.Text(e.text || "Input", {
                left: 10,
                top: 10,
                fontSize: 14,
                fill: "#666",
            })

            group = new fabric.Group([rect, text], {
                left: e.x,
                top: e.y,
            })
        }

        if (e.type === "button") {
            const rect = new fabric.Rect({
                width: 260,
                height: 44,
                rx: 6,
                ry: 6,
                fill: "#000",
            })

            const text = new fabric.Text(e.text || "Button", {
                left: 90,
                top: 12,
                fill: "#fff",
                fontSize: 14,
            })

            group = new fabric.Group([rect, text], {
                left: e.x,
                top: e.y,
            })
        }

        if (group) {
            ; (group as any).data = { generated: true }
            canvas.add(group)
        }
    })

    canvas.renderAll()
}

export default renderWireframe
