import { create } from "zustand"

interface CanvasState {
    activeTool: string
    canvasJSON: any
    setActiveTool: (tool: string) => void
    setCanvasJSON: (data: any) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
    activeTool: "Select",
    canvasJSON: null,
    setActiveTool: (tool) => set({ activeTool: tool }),
    setCanvasJSON: (data) => set({ canvasJSON: data }),
}))
