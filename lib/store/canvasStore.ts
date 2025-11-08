import { create } from "zustand"
import { Shape } from "../type"

interface CanvasState {
    shapes: Shape[]
    setShapes: (shapes: Shape[]) => void
    addShape: (shape: Shape) => void
    selectedId: string | null
    setSelectedId: (id: string | null) => void
    activeTool: string
    setActiveTool: (tool: string) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
    shapes: [],
    setShapes: (shapes) => set({ shapes }),
    addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
    selectedId: null,
    setSelectedId: (id) => set({ selectedId: id }),
    activeTool: "Select",
    setActiveTool: (tool) => set({ activeTool: tool }),
}))
