import * as fabric from "fabric"
import type { LaidOutBlock } from "../../../lib/store/canvasStore"

export function renderSemanticBlock(canvas: fabric.Canvas, block: any) {
    const { left, top, width, height, semantic } = block;

    const STYLES = {
        background: "#F4F4F5", // Slate 100
        border: "#E4E4E7",     // Slate 200
        text: "#71717A",       // Slate 500
        accent: "#6366F1",     // Indigo 500
        radius: 10
    };

    let object: fabric.Object;

    switch (semantic) {
        case "title_text":
            object = new fabric.Textbox("Heading Content", {
                left, top, width,
                fontSize: 24,
                fontWeight: "bold",
                fontFamily: "Inter, sans-serif",
                fill: "#18181B"
            });
            break;

        case "primary_action":
            // button pill
            const btnRect = new fabric.Rect({
                width, height: 44,
                rx: 6, ry: 6,
                fill: STYLES.accent,
            });
            const btnText = new fabric.Text("Get Started", {
                fontSize: 14,
                fill: "#FFFFFF",
                originX: "center", originY: "center",
                left: width / 2, top: 22
            });
            object = new fabric.Group([btnRect, btnText], { left, top });
            break;

        case "content_image":
            // professional placeholder 
            object = new fabric.Rect({
                left, top, width, height,
                fill: STYLES.background,
                stroke: STYLES.border,
                rx: STYLES.radius
            });
            const line1 = new fabric.Line([left, top, left + width, top + height], { stroke: STYLES.border });
            const line2 = new fabric.Line([left + width, top, left, top + height], { stroke: STYLES.border });
            canvas.add(line1, line2);
            break;

        default:
            object = new fabric.Rect({
                left, top, width, height,
                fill: STYLES.background,
                rx: 4
            });
    }

    canvas.add(object);
}
