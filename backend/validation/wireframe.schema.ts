import { z } from "zod"

/* ---------------- GRID ---------------- */

const GridSchema = z.object({
    colStart: z.number().min(1).max(12),
    colSpan: z.number().min(1).max(12),
    rowStart: z.number().min(1),
    rowSpan: z.number().min(1),
})

/* ---------------- FRAME ---------------- */

const FrameSchema = z.object({
    id: z.string(),

    type: z.enum([
        "frame",
        "card",
        "text",
        "button",
        "input",
        "image"
    ]),

    role: z.enum([
        "dominant",
        "supporting",
        "decorative"
    ]).optional(),

    importance: z.enum([
        "primary",
        "secondary"
    ]).optional(),

    intent: z.string().optional(),

    col: z.number().min(1).max(12),
    row: z.number().min(1),
    span: z.number().min(1).max(12),
    rowSpan: z.number().min(1),

    text: z.string().optional()
})


/* ---------------- SCREEN ---------------- */

const ScreenSchema = z.object({
    id: z.string(),
    name: z.string(),
    layoutPattern: z.enum([
        "hero",
        "feed",
        "grid",
        "settings",
        "auth",
        "marketing"
    ]).optional(),
    frames: z.array(FrameSchema).min(1)
})

/* ---------------- ROOT ---------------- */

export const WireframeSchema = z.object({
    screens: z.array(ScreenSchema).min(1)
})