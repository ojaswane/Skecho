import { z } from "zod";

const GridSchema = z.object({
    colStart: z.number(),
    colSpan: z.number(),
    rowStart: z.number(),
    rowSpan: z.number(),
});

const FrameSchema = z.object({
    id: z.string(),
    type: z.enum(["frame", "card", "text", "button", "input", "image"]),
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    text: z.string().optional(),
    grid: GridSchema.optional(),
});

const LayoutSchema = z.object({
    type: z.enum(["bento", "stack"]),
    columns: z.number(),
    gap: z.number(),
    padding: z.number(),
});

export const WireframeSchema = z.object({
    screens: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            layout: LayoutSchema.optional(),
            frames: z.array(FrameSchema),
        })
    ),
});
