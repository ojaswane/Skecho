import { create } from "zustand"
import { devtools } from "zustand/middleware"

type Tool = "Select" | "Rectangle" | "Circle" | "Text" | "Frame" | "Image" | "Arrow" | "line"

interface CanvasState {
    activeTool: Tool
    setActiveTool: (tool: Tool) => void

    canvas: fabric.Canvas | null
    setCanvas: (canvas: fabric.Canvas) => void

    canvasJSON: any
    setCanvasJSON: (json: any) => void

    selectedFrame: string | null
    setSelectedFrame: (frame: string | null) => void
}

export const useCanvasStore = create<CanvasState>()(
    devtools((set) => ({
        activeTool: "Select",
        setActiveTool: (tool) => set({ activeTool: tool }),

        canvas: null,
        setCanvas: (canvas) => set({ canvas }),

        canvasJSON: null,
        setCanvasJSON: (json) => set({ canvasJSON: json }),

        selectedFrame: null,
        setSelectedFrame: (frame) => set({ selectedFrame: frame }),
    }))
)
