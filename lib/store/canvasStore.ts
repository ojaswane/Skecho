// lib/store/canvasStore.ts
import { create } from "zustand"
import * as fabric from "fabric"

export type FrameType = "desktop" | "tablet" | "mobile"
export type FrameBadge = "idea" | "wireframe" | "final"

export type ToolType =
    | "Select"
    | "Rectangle"
    | "Circle"
    | "Text"
    | "Image"
    | "Arrow"
    | "Frame"
    | "Sketch"
    | null

export type CanvasElement = {
    id: string
    type: "card" | "text" | "button" | "input" | "image"
    role?: "dominant" | "supporting" | "decorative"
    col?: number
    row?: number
    span?: number
    rowSpan?: number
    width?: number
    height?: number
    text?: string
}

export type ArtboardFrame = {
    id: string
    device: FrameType
    badge: FrameBadge
    width: number
    height: number
    left: number
    top: number
    locked: boolean
}

export type ElementType =
    | "text"
    | "image"
    | "button"
    | "input"
    | "card"

export type WireframeElement = {
    id: string
    type: ElementType
    role?: string
    col?: number

    row?: number
    span?: number
    rowSpan?: number

    left?: number
    top?: number
    width?: number
    height?: number
}


export interface Screen {
    id: string
    name: string
    frame: {
        id: string
        width: number
        height: number
    }
    elements: WireframeElement[]
}


/* ------------------ ZUSTAND STATE ------------------ */
interface CanvasState {
    canvas: fabric.Canvas | null
    activeTool: ToolType
    theme: "light" | "dark"
    frames: ArtboardFrame[]
    activeFrameId: string | null
    selectedObject: fabric.Object | null
    defaultTextObject: fabric.Text | null

    setCanvas: (canvas: fabric.Canvas) => void
    setActiveTool: (tool: ToolType) => void
    addFrame: (frame: ArtboardFrame) => void
    setActiveFrame: (id: string | null) => void
    updateFrame: (id: string, data: Partial<ArtboardFrame>) => void
    setSelectedObject: (obj: fabric.Object | null) => void
    setDefaultTextObject: (text: fabric.Text) => void
}

/* ------------------ STORE ------------------ */
export const useCanvasStore = create<CanvasState>((set) => ({
    canvas: null,
    activeTool: "Select",
    theme:
        typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
    frames: [],
    activeFrameId: null,
    selectedObject: null,
    defaultTextObject: null,

    setCanvas: (canvas) => set({ canvas }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    addFrame: (frame) => set((state) => ({ frames: [...state.frames, frame] })),
    setActiveFrame: (id) => set({ activeFrameId: id }),
    updateFrame: (id, data) =>
        set((state) => ({
            frames: state.frames.map((f) => (f.id === id ? { ...f, ...data } : f)),
        })),
    setSelectedObject: (obj) => set({ selectedObject: obj }),
    setDefaultTextObject: (text) => set({ defaultTextObject: text }),
}))
