import { spacing } from "../../../tokens/spacing.js"
import { radius } from "../../../tokens/radius.js"
import { typography } from "../../../tokens/typography.js"
import { color, shadow } from "../../../tokens/color.js"
import { size } from "../../../tokens/size.js"

export const softPastelPreset = {
    id: "soft_pastel",
    spacing: {
        ...spacing,
        md: 18,
        lg: 28,
        xl: 40
    },
    radius: {
        ...radius,
        md: 14,
        lg: 20,
        xl: 28
    },
    typography: {
        ...typography,
        scale: {
            ...typography.scale,
            h1: { ...typography.scale.h1, weight: 600 },
            h2: { ...typography.scale.h2, weight: 600 },
            body: { ...typography.scale.body, size: 16 }
        }
    },
    color: {
        ...color,
        background: "#f8fafc",
        surface: "#ffffff",
        card: "#ffffff",
        textPrimary: "#0f172a",
        textMuted: "#6b7280",
        primary: "#6366f1",
        primarySoft: "#eef2ff",
        accent: "#ec4899",
        gradientPurple: "linear-gradient(135deg, #a78bfa 0%, #f9a8d4 100%)",
        gradientBlue: "linear-gradient(135deg, #7dd3fc 0%, #a5b4fc 100%)"
    },
    shadow: {
        sm: "0 6px 18px rgba(15,23,42,0.08)",
        md: "0 16px 36px rgba(15,23,42,0.12)",
        lg: "0 28px 60px rgba(15,23,42,0.16)"
    },
    size,
    contentWidth: "wide",
    density: "airy",
    style: "soft_pastel"
}
