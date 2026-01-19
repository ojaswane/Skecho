import * as fabric from "fabric"
import { renderCard } from "../../canvas/renderer/renderCards"
import { renderText } from "../../canvas/renderer/renderText"

type LayoutNode = {
    type: "card" | "text"
    x: number
    y: number
    title?: string
    description?: string
    text?: string
    spacing?: keyof any
}

export function resolvePresetToCanvas({
    canvas,
    layout,
    preset
}: {
    canvas: fabric.Canvas
    layout: LayoutNode[]
    preset: any
}) {
    layout.forEach((node) => {

        const spacingValue =
            node.spacing ? preset.spacing[node.spacing] : 0

        switch (node.type) {
            case "card": {
                const card = renderCard({
                    x: node.x,
                    y: node.y + spacingValue,
                    title: node.title,
                    description: node.description
                })

                canvas.add(card)
                break
            }

            case "text": {
                const style = preset.typography.scale.body

                const text = renderText({
                    x: node.x,
                    y: node.y + spacingValue,
                    text: node.text || "",
                    fontSize: style.size,
                    fontWeight: style.weight
                })

                canvas.add(text)
                break
            }
        }
    })

    canvas.renderAll()
}