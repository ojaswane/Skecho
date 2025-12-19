"use client"
import { create } from "zustand"
import * as fabric from "fabric"

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

type StrokeAlign = "inside" | "center" | "outside"

interface CanvasState {
    canvas: fabric.Canvas | null

    activeTool: ToolType
    theme: "light" | "dark"
    selectedFrame: FrameType
    canvasJSON: any

    selectedObject: fabric.Object | null

    elements: Array<{ id: number; fill?: string;[key: string]: any }>

    setCanvas: (canvas: fabric.Canvas) => void
    setActiveTool: (tool: ToolType) => void
    setTheme: (theme: "light" | "dark") => void
    toggleTheme: () => void
    setSelectedFrame: (frame: FrameType) => void
    setCanvasJSON: (json: any) => void
    setSelectedObject: (obj: fabric.Object | null) => void
    resetCanvas: () => void
    updateElementColor: (id: number, color: string) => void
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
    elements: [],

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

    updateElementColor(id, color) {
        set((state) => ({
            elements: state.elements.map((el) =>
                el.id === id ? { ...el, fill: color } : el
            ),
        }))
    },
}))
