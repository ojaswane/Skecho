export const typography = {
    fontFamily: "Inter, Arial ,poppins, SF Pro Display, system-ui, sans-serif", // these are just for the Ai results (we can change ts as we want while we edit )
    scale: {
        display: {
            size: 64,
            lineHeight: 1.05,
            weight: 700,
            tracking: -0.02
        },
        h1: {
            size: 48,
            lineHeight: 1.1,
            weight: 700,
            tracking: -0.01
        },
        h2: {
            size: 36,
            lineHeight: 1.15,
            weight: 600,
            tracking: -0.005
        },
        h3: {
            size: 28,
            lineHeight: 1.2,
            weight: 600,
            tracking: 0
        },
        title: {
            size: 22,
            lineHeight: 1.3,
            weight: 600,
            tracking: 0.005
        },
        subtitle: {
            size: 18,
            lineHeight: 1.4,
            weight: 500,
            tracking: 0.01
        },
        body: {
            size: 16,
            lineHeight: 1.6,
            weight: 400,
            tracking: 0.01
        },
        bodySm: {
            size: 14,
            lineHeight: 1.5,
            weight: 400,
            tracking: 0.01
        },
        caption: {
            size: 12,
            lineHeight: 1.4,
            weight: 500,
            tracking: 0.02
        },
        overline: {
            size: 11,
            lineHeight: 1.3,
            weight: 600,
            tracking: 0.08
        },
        button: {
            size: 14,
            lineHeight: 1.2,
            weight: 600,
            tracking: 0.02
        }
    }
} as const
