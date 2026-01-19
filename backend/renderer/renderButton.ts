function renderButton(preset, x, y, text) {
    return {
        type: "rect",
        x,
        y,
        width: 160,
        height: preset.components.button.height,
        rx: preset.tokens.radius.md,
        text
    }
}
