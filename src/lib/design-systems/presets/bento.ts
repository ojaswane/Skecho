import { spacing } from "../../../tokens/spacing"
import { radius } from "../../../tokens/radius"
import { typography } from "../../../tokens/typography"
import { color, shadow } from "../../../tokens/color"
import { size } from "../../../tokens/size"

export const bentoPreset = {
    id: "bento",
    spacing: {
        ...spacing,
        md: 16,
        lg: 24,
        xl: 32
    },
    radius: {
        ...radius,
        sm: 12,
        md: 16,
        lg: 24,
        xl: 32
    },
    typography: {
        ...typography,
        scale: {
            ...typography.scale,
            display: { ...typography.scale.display, weight: 700, tracking: -0.02 },
            h1: { ...typography.scale.h1, weight: 600, tracking: -0.01 },
            h2: { ...typography.scale.h2, weight: 600 }
        }
    },
    color: {
        ...color,
        background: "#fafafa",
        surface: "#ffffff",
        card: "#ffffff",
        textPrimary: "#09090b",
        textMuted: "#71717a",
        primary: "#18181b",
        primarySoft: "#f4f4f5",
        accent: "#2563eb",
        gradientPurple: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
        gradientBlue: "linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)"
    },
    shadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.05)",
        lg: "0 10px 15px rgba(0,0,0,0.08)"
    },
    size,
    contentWidth: "wide",
    density: "normal",
    style: "bento"
}
