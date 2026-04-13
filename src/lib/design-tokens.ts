// Design tokens for professional SaaS UI generation
export const designTokens = {
    colors: {
        // Backgrounds
        bg: {
            primary: '#ffffff',
            secondary: '#f8f9fa',
            tertiary: '#f0f2f5',
            dark: '#1a1a1a',
            darkSecondary: '#2d3748',
            darkTertiary: '#3a4556',
        },

        // Text
        text: {
            primary: '#1a1a1a',
            secondary: '#6b7280',
            tertiary: '#9ca3af',
            inverse: '#ffffff',
        },

        // Brand
        primary: '#0070f3',
        primaryLight: '#e0eaff',
        accent: '#ffd000',
        accentLight: '#fff9e6',

        // Semantic
        success: '#10b981',
        successLight: '#ecfdf5',
        error: '#ef4444',
        errorLight: '#fef2f2',
        warning: '#f59e0b',
        warningLight: '#fffbeb',
        info: '#3b82f6',
        infoLight: '#eff6ff',

        // Borders & dividers
        border: '#e5e7eb',
        borderDark: '#4a5568',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
        '4xl': 40,
    },

    typography: {
        h1: { fontSize: 32, fontWeight: 700, lineHeight: 1.2 },
        h2: { fontSize: 24, fontWeight: 700, lineHeight: 1.3 },
        h3: { fontSize: 20, fontWeight: 600, lineHeight: 1.4 },
        h4: { fontSize: 16, fontWeight: 600, lineHeight: 1.5 },
        body: { fontSize: 14, fontWeight: 400, lineHeight: 1.6 },
        bodySmall: { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
        meta: { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },
    },

    radius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },

    shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
}

export type DesignTokens = typeof designTokens
