import { spacing } from "../../../tokens/spacing"
import { radius } from "../../../tokens/radius"
import { typography } from "../../../tokens/typography"
import { color, shadow } from "../../../tokens/color"
import { size } from "../../../tokens/size"

export const brutalistPreset = {
    id: "brutalist",
    spacing: {
        ...spacing,
        md: 20,
        lg: 32,
        xl: 48
    },
    radius: {
        ...radius,
        sm: 0,
        md: 0,
        lg: 0,
        xl: 0
    },
    typography: {
        ...typography,
        scale: {
            ...typography.scale,
            display: { ...typography.scale.display, weight: 900, tracking: -0.04 },
            h1: { ...typography.scale.h1, weight: 800, tracking: -0.03 },
            h2: { ...typography.scale.h2, weight: 800, tracking: -0.02 },
            h3: { ...typography.scale.h3, weight: 700 }
        }
    },
    color: {
        ...color,
        background: "#ffffff",
        surface: "#000000",
        card: "#000000",
        textPrimary: "#000000",
        textMuted: "#525252",
        primary: "#000000",
        primarySoft: "#f5f5f5",
        accent: "#ff3300",
        gradientPurple: "linear-gradient(135deg, #000000 0%, #000000 100%)",
        gradientBlue: "linear-gradient(135deg, #000000 0%, #000000 100%)"
    },
    shadow: {
        sm: "4px 4px 0px rgba(0,0,0,1)",
        md: "6px 6px 0px rgba(0,0,0,1)",
        lg: "8px 8px 0px rgba(0,0,0,1)"
    },
    size,
    contentWidth: "wide",
    density: "compact",
    style: "brutalist"
}
