"use client"
import { create } from "zustand"
import * as fabric from "fabric"

/* ------------------ BASIC TYPES ------------------ */

export type FrameType = "desktop" | "tablet" | "mobile"
export type FrameBadge = "idea" | "wireframe" | "final"

type ToolType =
    | "Select"
    | "Rectangle"
    | "Circle"
    | "Text"
    | "Image"
    | "Arrow"
    | "Frame"
    | "Sketch"
    | null

/* ------------------ GRID ------------------ */

export type Grid = {
    col: number
    row: number
    span: number
    rowSpan: number
}

/* ------------------ CANVAS ELEMENTS (AI / Layout) ------------------ */
/* These are things INSIDE a frame */

export type CanvasElement = {
    id: string
    type: "card" | "text" | "button" | "input" | "image"
    role?: "dominant" | "supporting" | "decorative"

    // grid-based layout
    col?: number
    row?: number
    span?: number
    rowSpan?: number

    // optional rendering data
    width?: number
    height?: number
    text?: string
}

/* ------------------ ARTBOARD FRAME ------------------ */
/* This is the actual Figma-like frame */

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

/* ------------------ ZUSTAND STATE ------------------ */

interface CanvasState {
    canvas: fabric.Canvas | null

    activeTool: ToolType
    theme: "light" | "dark"

    frames: ArtboardFrame[] // This is the real frame
    activeFrameId: string | null

    selectedObject: fabric.Object | null

    /* -------- actions -------- */
    setCanvas: (canvas: fabric.Canvas) => void
    setActiveTool: (tool: ToolType) => void

    addFrame: (frame: ArtboardFrame) => void
    setActiveFrame: (id: string | null) => void
    updateFrame: (id: string, data: Partial<ArtboardFrame>) => void

    setSelectedObject: (obj: fabric.Object | null) => void

    defaultTextObject: fabric.Text | null
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

    /* -------- setters -------- */

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

    setDefaultTextObject: (text) =>
        set(() => ({ defaultTextObject: text })),
}))
