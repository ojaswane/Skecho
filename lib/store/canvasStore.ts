"use client"
import { create } from "zustand"
import type { Canvas as FabricCanvas, Object as FabricObject } from "fabric/fabric-impl"

type FrameType = "desktop" | "tablet" | "mobile" | null
type ToolType =
    | "Select"
    | "Rectangle"
    | "Circle"
    | "Text"
    | "Image"
    | "Arrow"
    | "Frame"
    | null

interface CanvasState {
    canvas: FabricCanvas | null

    // Toolbar tool
    activeTool: ToolType

    // Current theme
    theme: "light" | "dark"

    // Figma frame
    selectedFrame: FrameType

    // Whole canvas JSON
    canvasJSON: any

    // Currently selected fabric object (for right sidebar)
    selectedObject: FabricObject | null

    setCanvas: (canvas: FabricCanvas) => void
    setActiveTool: (tool: ToolType) => void
    setTheme: (theme: "light" | "dark") => void
    toggleTheme: () => void
    setSelectedFrame: (frame: FrameType) => void
    setCanvasJSON: (json: any) => void


    setSelectedObject: (obj: FabricObject | null) => void

    resetCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    canvas: null,
    activeTool: "Select",
    theme:
        typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",

    selectedFrame: null,
    canvasJSON: null,

    selectedObject: null,
    setCanvas: (canvas) => set({ canvas }),
    
    setActiveTool: (tool) => set({ activeTool: tool }),

    setTheme: (theme) => {
        set({ theme })
        if (typeof document !== "undefined") {
            if (theme === "dark") document.documentElement.classList.add("dark")
            else document.documentElement.classList.remove("dark")
        }
    },

    toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark"
        get().setTheme(newTheme)
    },

    setSelectedFrame: (frame) => set({ selectedFrame: frame }),

    setCanvasJSON: (json) => set({ canvasJSON: json }),

    setSelectedObject: (obj) => set({ selectedObject: obj }),

    resetCanvas: () => {
        const c = get().canvas
        if (c) c.clear()
        set({
            canvasJSON: null,
            selectedFrame: null,
            activeTool: "Select",
            selectedObject: null,
        })
    },
}))

export const selectedObject = useCanvasStore((e) => e.selectedObject);