import * as fabric from "fabric"

export function renderSemanticBlock(block: any): fabric.Object {
    const { left, top, width, height, semantic, theme } = block;

    const STYLES = {
        background: theme?.background ?? "#F4F4F5", // Slate 100
        border: theme?.border ?? "#E4E4E7",// Slate 200
        text: theme?.text ?? "#71717A",// Slate 500
        accent: theme?.accent ?? "#4F46E5",// Indigo 600-ish
        radius: theme?.radius ?? 16
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
            // Apple-ish pill button
            const btnRect = new fabric.Rect({
                width: Math.min(width, 240),
                height: 44,
                rx: 22, ry: 22,
                fill: STYLES.accent,
            });
            const btnText = new fabric.Text("Get Started", {
                fontSize: 14,
                fill: "#FFFFFF",
                originX: "center", originY: "center",
                left: btnRect.width! / 2, top: 22
            });
            object = new fabric.Group([btnRect, btnText], { left, top });
            break;

        case "content_image":
            // professional placeholder
            const imageRect = new fabric.Rect({
                left: 0,
                top: 0,
                width,
                height,
                fill: STYLES.background,
                stroke: STYLES.border,
                rx: STYLES.radius,
                ry: STYLES.radius,
            });
            const line1 = new fabric.Line([0, 0, width, height], { stroke: STYLES.border });
            const line2 = new fabric.Line([width, 0, 0, height], { stroke: STYLES.border });
            object = new fabric.Group([imageRect, line1, line2], { left, top });
            break;

        default:
            object = new fabric.Rect({
                left, top, width, height,
                fill: STYLES.background,
                stroke: STYLES.border,
                strokeWidth: 1,
                rx: STYLES.radius,
                ry: STYLES.radius,
            });
    }

    return object;
}
