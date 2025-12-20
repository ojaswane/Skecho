"use client"
import { create } from "zustand"
import * as fabric from "fabric"

type FrameType = "desktop" | "tablet" | "mobile"
type FrameBadge = "idea" | "wireframe" | "design"

type ToolType =
    | "Select"
    | "Rectangle"
    | "Circle"
    | "Text"
    | "Image"
    | "Arrow"
    | "Frame"
    | null

interface Frame {
    id: string
    device: FrameType
    badge: FrameBadge
    left: number
    top: number
    width: number
    height: number
    locked: boolean
}

interface CanvasState {
    canvas: fabric.Canvas | null

    activeTool: ToolType
    theme: "light" | "dark"

    frames: Frame[]
    activeFrameId: string | null

    selectedObject: fabric.Object | null

    setCanvas: (canvas: fabric.Canvas) => void
    setActiveTool: (tool: ToolType) => void

    addFrame: (frame: Frame) => void
    setActiveFrame: (id: string | null) => void
    updateFrame: (id: string, data: Partial<Frame>) => void

    setSelectedObject: (obj: fabric.Object | null) => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
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

    setCanvas: (canvas) => set({ canvas }),

    setActiveTool: (tool) => set({ activeTool: tool }),

    addFrame: (frame) =>
        set((state) => ({
            frames: [...state.frames, frame],
        })),

    setActiveFrame: (id) => set({ activeFrameId: id }),

    updateFrame: (id, data) =>
        set((state) => ({
            frames: state.frames.map((f) =>
                f.id === id ? { ...f, ...data } : f
            ),
        })),

    setSelectedObject: (obj) => set({ selectedObject: obj }),
}))
