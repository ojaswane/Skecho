"use client"
import { create } from "zustand"
import type { Canvas as FabricCanvas } from "fabric/fabric-impl"

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

    // Currently active tool
    activeTool: ToolType

    // Theme
    theme: "light" | "dark"

    // Frame type
    selectedFrame: FrameType

    // JSON data for the canvas
    canvasJSON: any

    //actions
    setCanvas: (canvas: FabricCanvas) => void
    setActiveTool: (tool: ToolType) => void
    setTheme: (theme: "light" | "dark") => void
    toggleTheme: () => void
    setSelectedFrame: (frame: FrameType) => void
    setCanvasJSON: (json: any) => void
    resetCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    canvas: null,
    activeTool: "Select",
    theme:
        typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
    selectedFrame: null,
    canvasJSON: null,

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
    resetCanvas: () => {
        const c = get().canvas
        if (c) c.clear()
        set({
            canvasJSON: null,
            selectedFrame: null,
            activeTool: "Select",
        })
    },
}))