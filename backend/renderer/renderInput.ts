import * as fabric  from "fabric"

type RenderInputProps = {
    x: number
    y: number
    width?: number
    height?: number
    placeholder?: string
}

export function renderInput({
    x,
    y,
    width = 280,
    height = 44,
    placeholder = "Enter text"
}: RenderInputProps) {
    const inputBg = new fabric.Rect({
        left: x,
        top: y,
        width,
        height,
        rx: 8,
        ry: 8,
        fill: "#ffffff",
        stroke: "#d1d5db",
        strokeWidth: 1,
        selectable: true
    })

    const inputText = new fabric.Textbox(placeholder, {
        left: x + 12,
        top: y + height / 2,
        width: width - 24,
        fontSize: 14,
        fill: "#9ca3af",
        originY: "center",
        selectable: true
    })

    const group = new fabric.Group([inputBg, inputText], {
        selectable: true
    })

    return group
}
