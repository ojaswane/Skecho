import * as fabric  from "fabric"

type RenderTextProps = {
  x: number
  y: number
  text: string
  fontSize?: number
  fontWeight?: number
  color?: string
  width?: number
}

export function renderText({
  x,
  y,
  text,
  fontSize = 16,
  fontWeight = 400,
  color = "#111827",
  width = 400
}: RenderTextProps) {
  return new fabric.Textbox(text, {
    left: x,
    top: y,
    width,
    fontSize,
    fontWeight,
    fill: color,
    selectable: true
  })
}
