import * as fabric from "fabric"

type Element = {
    type: string
    x?: number
    y?: number
    width?: number
    height?: number
    text?: string
    data?: any
}

const render = (canvas: fabric.Canvas, elements: Element[]) => {
    if (!canvas || !elements?.length) return

    elements.forEach((e) => {
        const x = Math.max(e.x ?? 40, 20)
        const y = Math.max(e.y ?? 40, 20)

        /* ---------------- FRAME ---------------- */
        if (e.type === "frame") {
            const rect = new fabric.Rect({
                left: x,
                top: y,
                width: e.width || 320,
                height: e.height || 240,
                fill: "#f3f4f6",
                stroke: "#d1d5db",
                strokeWidth: 1,
                rx: 8,
                ry: 8,
                selectable: true,
            })

                ; (rect as any).data = e.data
            canvas.add(rect)
        }

        /* ---------------- CARD ---------------- */
        if (e.type === "card") {
            const rect = new fabric.Rect({
                left: x,
                top: y,
                width: e.width || 240,
                height: e.height || 120,
                rx: 12,
                ry: 12,
                fill: "#ffffff",
                stroke: "#e5e7eb",
                strokeWidth: 1,
                selectable: true,
            })

            const text = new fabric.Textbox(e.text || "Card", {
                left: x + 12,
                top: y + 12,
                width: (e.width || 240) - 24,
                fontSize: 14,
                fill: "#111827",
                selectable: true,
            })

                ; (rect as any).data = e.data
                ; (text as any).data = e.data

            canvas.add(rect, text)
        }

        /* ---------------- TEXT ---------------- */
        if (e.type === "text") {
            const text = new fabric.Textbox(e.text || "Text", {
                left: x,
                top: y,
                width: e.width || 300,
                fontSize: 28,
                fontWeight: "bold",
                fill: "#111827",
                selectable: true,
            })

                ; (text as any).data = e.data
            canvas.add(text)
        }

        /* ---------------- IMAGE / AVATAR ---------------- */
        if (e.type === "image") {
            const radius = (e.width || 80) / 2

            const circle = new fabric.Circle({
                left: x,
                top: y,
                radius,
                fill: "#3b82f6",
                selectable: true,
            })

                ; (circle as any).data = e.data
            canvas.add(circle)
        }

        /* ---------------- INPUT ---------------- */
        if (e.type === "input") {
            const rect = new fabric.Rect({
                left: x,
                top: y,
                width: e.width || 260,
                height: e.height || 40,
                rx: 6,
                ry: 6,
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 1,
                selectable: true,
            })

            const text = new fabric.Text(e.text || "Input", {
                left: x + 10,
                top: y + 10,
                fontSize: 14,
                fill: "#6b7280",
                selectable: true,
            })

                ; (rect as any).data = e.data
                ; (text as any).data = e.data

            canvas.add(rect, text)
        }

        /* ---------------- BUTTON ---------------- */
        if (e.type === "button") {
            const rect = new fabric.Rect({
                left: x,
                top: y,
                width: e.width || 260,
                height: e.height || 44,
                rx: 6,
                ry: 6,
                fill: "#000000",
                selectable: true,
            })

            const text = new fabric.Text(e.text || "Button", {
                left: x + 90,
                top: y + 12,
                fill: "#ffffff",
                fontSize: 14,
                selectable: true,
            })

                ; (rect as any).data = e.data
                ; (text as any).data = e.data

            canvas.add(rect, text)
        }
    })

    canvas.requestRenderAll()
}

export default render