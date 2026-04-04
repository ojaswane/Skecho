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
        // Dark premium dashboard surfaces (layered elevation)
        background: "#121214",
        backgroundMuted: "#15161A",
        surface: "#181A1F",
        card: "#1D2027",
        // Text + borders tuned for dark mode readability
        textPrimary: "#E7EAF0",
        textMuted: "#9CA3AF",
        border: "#2A2D36",
        borderStrong: "#343843",
        // Accent system (neon green + deep blue like references)
        primary: "#C6FF4A",
        primarySoft: "#2A2F1D",
        accent: "#4C6FFF",
        // Optional gradients for hero panels
        gradientPurple: "linear-gradient(135deg, #1B1E2B 0%, #282C3A 100%)",
        gradientBlue: "linear-gradient(135deg, #0F1B2B 0%, #1C2A3C 100%)",
        // Sidebar-specific tones
        sidebarBg: "#141416",
        sidebarBorder: "#232328",
        sidebarItem: "#1B1B20",
        sidebarActive: "#3B32B2",
        sidebarButton: "#5B5BFF"
    },
    shadow: {
        sm: "0 4px 10px rgba(0,0,0,0.35)",
        md: "0 12px 28px rgba(0,0,0,0.45)",
        lg: "0 28px 56px rgba(0,0,0,0.55)"
    },
    size,
    contentWidth: "wide",
    density: "airy",
    style: "premium_dashboard"
}
