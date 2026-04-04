import { spacing } from "../../../tokens/spacing"
import { radius } from "../../../tokens/radius"
import { typography } from "../../../tokens/typography"
import { color, shadow } from "../../../tokens/color"
import { size } from "../../../tokens/size"

export const premiumDashboardPreset = {
    id: "premium_dashboard",
    spacing: {
        ...spacing,
        md: 18,
        lg: 28,
        xl: 44
    },
    radius: {
        ...radius,
        md: 16,
        lg: 26,
        xl: 36
    },
    typography: {
        ...typography,
        fontFamily: "Manrope, Space Grotesk, Inter, system-ui, sans-serif",
        scale: {
            ...typography.scale,
            display: { ...typography.scale.display, size: 58, weight: 700 },
            h1: { ...typography.scale.h1, size: 44, weight: 700 },
            h2: { ...typography.scale.h2, size: 34, weight: 600 },
            body: { ...typography.scale.body, size: 16, lineHeight: 1.6 }
        }
    },
    color: {
        ...color,
        background: "#eef1f4",
        backgroundMuted: "#f4f5f7",
        surface: "#f7f6f2",
        card: "#f8f7f3",
        textPrimary: "#111827",
        textMuted: "#6b7280",
        border: "#e7e5e4",
        borderStrong: "#d6d3d1",
        primary: "#f5c84c",
        primarySoft: "#fff5cc",
        accent: "#f59e0b",
        gradientPurple: "linear-gradient(135deg, #e9e3ff 0%, #fff3d6 100%)",
        gradientBlue: "linear-gradient(135deg, #d7e8ff 0%, #f7f3dd 100%)"
    },
    shadow: {
        sm: "0 4px 12px rgba(17,24,39,0.08)",
        md: "0 12px 28px rgba(17,24,39,0.12)",
        lg: "0 28px 56px rgba(17,24,39,0.18)"
    },
    size,
    contentWidth: "wide",
    density: "airy",
    style: "premium_dashboard"
}
