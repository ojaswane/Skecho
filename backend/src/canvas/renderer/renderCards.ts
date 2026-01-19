import * as fabric from "fabric"

type RenderCardProps = {
    x: number
    y: number
    width?: number
    height?: number
    title?: string
    description?: string
}

export function renderCard({
    x,
    y,
    width = 320,
    height = 180,
    title = "Card title",
    description = "This is a short description inside the card."
}: RenderCardProps) {

    // Card background
    const cardBg = new fabric.Rect({
        left: x,
        top: y,
        width,
        height,
        rx: 16,
        ry: 16,
        fill: "#ffffff",
        shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.08)",
            blur: 16,
            offsetX: 0,
            offsetY: 6
        }),
        selectable: false
    })

    // Title
    const cardTitle = new fabric.Textbox(title, {
        left: x + 20,
        top: y + 20,
        width: width - 40,
        fontSize: 18,
        fontWeight: 600,
        fill: "#111827",
        selectable: true
    })

    // Description
    const cardDescription = new fabric.Textbox(description, {
        left: x + 20,
        top: y + 54,
        width: width - 40,
        fontSize: 14,
        fill: "#6b7280",
        selectable: true
    })

    // Group everything
    const cardGroup = new fabric.Group(
        [cardBg, cardTitle, cardDescription],
        {
            selectable: true
        }
    )

    return cardGroup
}
