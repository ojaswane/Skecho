import { spacing } from "../../../tokens/spacing.js"
import { radius } from "../../../tokens/radius.js"
import { typography } from "../../../tokens/typography.js"
import { color, shadow } from "../../../tokens/color.js"
import { size } from "../../../tokens/size.js"

export const glassNeonPreset = {
    id: "glass_neon",
    spacing: {
        ...spacing,
        md: 20,
        lg: 28,
        xl: 36
    },
    radius: {
        ...radius,
        lg: 20,
        xl: 28,
        xxl: 36
    },
    typography: {
        ...typography,
        scale: {
            ...typography.scale,
            display: { ...typography.scale.display, weight: 700, tracking: -0.03 },
            h1: { ...typography.scale.h1, weight: 700, tracking: -0.02 }
        }
    },
    color: {
        ...color,
        background: "#0a0b12",
        surface: "#121826",
        card: "rgba(255,255,255,0.08)",
        textPrimary: "#f8fafc",
        textMuted: "#a3aed0",
        primary: "#8b5cf6",
        primarySoft: "rgba(139,92,246,0.15)",
        accent: "#22d3ee",
        gradientPurple: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
        gradientBlue: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)"
    },
    shadow: {
        sm: "0 6px 18px rgba(59,130,246,0.18)",
        md: "0 14px 40px rgba(139,92,246,0.25)",
        lg: "0 24px 60px rgba(16,24,40,0.45)"
    },
    size,
    contentWidth: "wide",
    density: "airy",
    style: "glass_neon"
}
