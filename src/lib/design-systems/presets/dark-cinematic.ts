import { spacing } from "../../../tokens/spacing"
import { radius } from "../../../tokens/radius"
import { typography } from "../../../tokens/typography"
import { color, shadow } from "../../../tokens/color"
import { size } from "../../../tokens/size"

export const darkCinematicPreset = {
    id: "dark_cinematic",
    spacing: {
        ...spacing,
        md: 18,
        lg: 26,
        xl: 34
    },
    radius: {
        ...radius,
        md: 10,
        lg: 14,
        xl: 20
    },
    typography: {
        ...typography,
        scale: {
            ...typography.scale,
            display: { ...typography.scale.display, size: 72, weight: 700, tracking: -0.03 },
            h1: { ...typography.scale.h1, size: 52, weight: 700, tracking: -0.02 },
            body: { ...typography.scale.body, size: 17 }
        }
    },
    color: {
        ...color,
        background: "#0a0a0b",
        surface: "#0f1115",
        card: "#141820",
        textPrimary: "#f1f5f9",
        textMuted: "#94a3b8",
        primary: "#f59e0b",
        primarySoft: "rgba(245,158,11,0.15)",
        accent: "#22c55e"
    },
    shadow: {
        sm: "0 6px 18px rgba(0,0,0,0.45)",
        md: "0 18px 48px rgba(0,0,0,0.55)",
        lg: "0 32px 80px rgba(0,0,0,0.7)"
    },
    size,
    contentWidth: "wide",
    density: "normal",
    style: "dark_cinematic"
}
