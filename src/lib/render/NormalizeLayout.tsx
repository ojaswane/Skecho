// ts noremalise the rendered size of unstructured output from AI

const NormalizeLayout = (
    elements: any[],
    frame: { left: number; top: number; width: number; height: number }
) => {
    const PADDING = 32
    const GAP = 32

    let cursorY = frame.top + PADDING

    return elements.map((e) => {
        const width = e.width || 260
        const height = e.height || 80

        // Center horizontally
        const x =
            frame.left + frame.width / 2 - width / 2

        // Stack vertically
        const y = cursorY
        cursorY += height + GAP

        return {
            ...e,
            x,
            y,
            width,
            height,
        }
    })

}

export default NormalizeLayout