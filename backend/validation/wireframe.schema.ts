import { z } from 'zod'

// ** Frame schema **
export const frameSchema = () => z.object({
    id: z.string().max(1),
    type: z.enum(["frame", "card", "text", "button", "input", "image"]),
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().positive(),
    height: z.number().positive(),
    text: z.string().optional()
})

// *wireframe schema*
export const ScreenSchema = () => z.object({
    id: z.string().max(2),
    name: z.string().min(1),
    frames: z.array(frameSchema()).min(1)
})

// AI response
export const WireframeSchema = z.object({
    screens: z.array(ScreenSchema()).min(1)
});