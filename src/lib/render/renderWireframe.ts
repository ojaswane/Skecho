import * as fabric from "fabric"

const render = (canvas: fabric.Canvas, elements: any[]) => {
    if (!canvas || !elements) return

    elements.forEach((e) => {
        
        const x = Math.min(e.x ?? 40, canvas.getWidth() - 50)
        const y = Math.min(e.y ?? 40, canvas.getHeight() - 50)

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
                strokeWidth: 1,
                selectable: true
            })

            const text = new fabric.Text(e.text || "Input", {
                left: e.x + 10,
                top: e.y + 10,
                fontSize: 14,
                fill: "#666",
                selectable: true
            })

                ; (rect as any).data = { generated: true }
                ; (text as any).data = { generated: true }

            canvas.add(rect)
            canvas.add(text)
        }

        if (e.type === "button") {
            const rect = new fabric.Rect({
                left: e.x,
                top: e.y,
                width: 260,
                height: 44,
                rx: 6,
                ry: 6,
                fill: "#000",
                selectable: true
            })

            const text = new fabric.Text(e.text || "Button", {
                left: e.x + 90,
                top: e.y + 12,
                fill: "#fff",
                fontSize: 14,
                selectable: true
            })

                ; (rect as any).data = { generated: true }
                ; (text as any).data = { generated: true }

            canvas.add(rect)
            canvas.add(text)
        }
    })

    canvas.renderAll()
}

export default render
