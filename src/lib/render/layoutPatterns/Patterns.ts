import { Element } from "../renderWireframe"

export type LayoutPattern =
    | "hero"
    | "features"
    | "cta"
    | "pricing"
    | "auth"

export const PATTERNS: Record<LayoutPattern, Element[]> = {
    hero: [
        { type: "frame", width: 1200, height: 800 },

        { type: "text", col: 1, row: 1, span: 6, text: "Build faster with AI" },

        { type: "text", col: 1, row: 2, span: 6, text: "Generate wireframes instantly" },

        { type: "button", col: 1, row: 3, span: 3, text: "Get Started" },

        { type: "image", col: 7, row: 1, span: 6, rowSpan: 4 },
    ],

    features: [
        { type: "frame", width: 1200, height: 900 },

        { type: "text", col: 1, row: 1, span: 12, text: "Features" },

        { type: "card", col: 1, row: 2, span: 4, text: "Fast" },
        { type: "card", col: 5, row: 2, span: 4, text: "Smart" },
        { type: "card", col: 9, row: 2, span: 4, text: "Flexible" },
    ],

    cta: [
        { type: "frame", width: 1200, height: 500 },

        { type: "card", col: 2, row: 2, span: 10 },

        { type: "text", col: 3, row: 2, span: 8, text: "Ready to build?" },

        { type: "button", col: 5, row: 3, span: 4, text: "Start Now" },
    ],

    pricing: [
        { type: "frame", width: 1200, height: 900 },

        { type: "text", col: 1, row: 1, span: 12, text: "Pricing" },

        { type: "card", col: 1, row: 2, span: 4, text: "Free" },
        { type: "card", col: 5, row: 2, span: 4, text: "Pro" },
        { type: "card", col: 9, row: 2, span: 4, text: "Enterprise" },
    ],

    auth: [
        { type: "frame", width: 500, height: 700 },

        { type: "text", col: 1, row: 1, span: 12, text: "Login" },

        { type: "input", col: 1, row: 2, span: 12, text: "Email" },
        { type: "input", col: 1, row: 3, span: 12, text: "Password" },

        { type: "button", col: 1, row: 4, span: 12, text: "Sign In" },
    ],
}


export default PATTERNS