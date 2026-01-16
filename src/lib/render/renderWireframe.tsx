// This file renders from backend to frontend
import * as fabric from 'fabric'
 const render = (
    canvas: fabric.Canvas,
    elements: any[]
) => {

    // dummy data 
    elements.forEach((e, index) => {
        // input field
        if (e.type === "input") {
            const rect = new fabric.Rect({
                left: e.x,
                top: e.y,
                width: 260,
                height: 40,
                rx: 6,
                ry: 6,
                fill: "#fff",
                stroke: "#000",
                strokeWidth: 1
            })

            const text = new fabric.Text(e.text || "Input", {
                left: e.x + 10,
                top: e.y + 10,
                fontSize: 14,
                fill: "#666"
            })

            const group = new fabric.Group([rect, text])
            canvas.add(group)
        }

        // button
        if (e.type === "button") {
            const rect = new fabric.Rect({
                left: e.x,
                top: e.y,
                width: 260,
                height: 44,
                rx: 6,
                ry: 6,
                fill: "#000"
            })

            const text = new fabric.Text(e.text || "Button", {
                left: e.x + 90,
                top: e.y + 12,
                fill: "#fff",
                fontSize: 14
            })

            const group = new fabric.Group([rect, text])
            canvas.add(group)
        }
        canvas.renderAll()
    })
}

export default render