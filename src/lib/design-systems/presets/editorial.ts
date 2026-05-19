import { spacing } from "../../../tokens/spacing"
import { radius } from "../../../tokens/radius"
import { typography } from "../../../tokens/typography"
import { color, shadow } from "../../../tokens/color"
import { size } from "../../../tokens/size"

export const editorialPreset = {
    id: "editorial",
    spacing: {
        ...spacing,
        md: 24,
        lg: 40,
        xl: 56,
        xxl: 72
    },
    radius: {
        ...radius,
        sm: 4,
        md: 6,
        lg: 8
    },
    typography: {
        ...typography,
        scale: {
            ...typography.scale,
            display: { ...typography.scale.display, weight: 400, tracking: -0.03, style: "italic" },
            h1: { ...typography.scale.h1, weight: 500, tracking: -0.02 },
            h2: { ...typography.scale.h2, weight: 500, tracking: -0.01 },
            h3: { ...typography.scale.h3, weight: 600 }
        }
    },
    color: {
        ...color,
        background: "#fdfcf8",
        surface: "#ffffff",
        card: "#ffffff",
        textPrimary: "#1a1a1a",
        textMuted: "#6b6b6b",
        primary: "#1a1a1a",
        primarySoft: "#f5f5f3",
        accent: "#dc2626",
        gradientPurple: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
        gradientBlue: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)"
    },
    shadow: {
        sm: "0 1px 3px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.06)",
        lg: "0 8px 24px rgba(0,0,0,0.08)"
    },
    size,
    contentWidth: "medium",
    density: "airy",
    style: "editorial"
}
