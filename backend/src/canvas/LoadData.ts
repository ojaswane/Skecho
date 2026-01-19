import { renderInput } from "../canvas/renderer/renderInput"
import { renderText } from "../canvas/renderer/renderText"
import * as fabric from 'fabric'

const input = renderInput({
    x: 100,
    y: 150,
    placeholder: "Email address"
})

const heading = renderText({
    x: 100,
    y: 80,
    text: "Sign up",
    fontSize: 28,
    fontWeight: 600
})

const canvas = new fabric.Canvas(null);

canvas.add(heading)
canvas.add(input)
canvas.renderAll()
