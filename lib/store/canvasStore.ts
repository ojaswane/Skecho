// lib/store/canvasStore.ts
import { create } from "zustand"
import * as fabric from "fabric"
import type {
    AiDocument,
    AiPatch,
    AiPatchTarget,
    RealtimeFrameStatus,
    UserEditTarget,
} from "../realtime/protocol"

export type FrameType = "desktop" | "tablet" | "mobile"
export type FrameBadge = "Sketch" | "Idea" | "AiZone"

export type SemanticBlock = {
    id: string
    kind:
    | "profile_image"
    | "content_image"
    | "title_text"
    | "body_text"
    | "meta_text"
    | "primary_action"
}

export type LaidOutBlock = {
    id: string
    left: number
    top: number
    width: number
    height: number
    rule: any
}


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
    sectionId?: string    // Unique ID for the section
    linkedFrameId?: string //  The ID of the partner frame in the pair (Sketch <-> AI Zone) => I am a Sketch frame, and my AI Result is Frame XYZ.
    isMain?: boolean //  True if this is the Sketch frame in a pair, false if it's the AI Zone
    role?: 'refinement' | 'suggestion'
    device: FrameType
    badge: FrameBadge
    width: number
    height: number
    left: number
    top: number
    locked: boolean
    status?: "ghost" | "generating" | "ready" | RealtimeFrameStatus
    version?: number
    lastPatchedAt?: number
}
export type Frame = ArtboardFrame

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
    frames: WireframeElement[]
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
    aiDocsByFrameId: Record<string, AiDocument>
    userEditedByFrameId: Record<
        string,
        { sections: Record<string, true>; elements: Record<string, true> }
    >

    setCanvas: (canvas: fabric.Canvas) => void
    setActiveTool: (tool: ToolType) => void
    addFrame: (frame: ArtboardFrame) => void
    addSection: (sketchFrame: ArtboardFrame, aiFrame: ArtboardFrame) => void
    setActiveFrame: (id: string | null) => void
    updateFrame: (id: string, data: Partial<ArtboardFrame>) => void
    setSelectedObject: (obj: fabric.Object | null) => void
    setDefaultTextObject: (text: fabric.Text) => void
    deleteFrame: (id: string) => void
    setAiDoc: (frameId: string, doc: AiDocument) => void
    applyAiPatch: (frameId: string, patch: AiPatch) => void
    setFrameLocked: (id: string, locked: boolean) => void
    markUserEdited: (frameId: string, target: UserEditTarget) => void
    clearUserEdits: (frameId: string) => void
}

const applyPatchToDoc = (doc: AiDocument, patch: AiPatch): AiDocument => {
    const next: AiDocument = {
        ...doc,
        version: Math.max(doc.version, patch.version),
        updatedAt: patch.ts,
    }

    const target = patch.target as AiPatchTarget

    if (target === "document") {
        return {
            ...next,
            ...(patch.payload ?? {}),
        } as AiDocument
    }

    if (target === "section") {
        if (!patch.id) return next
        if (patch.op === "remove") {
            next.sections = next.sections.filter((s) => s.id !== patch.id)
            return next
        }
        const idx = next.sections.findIndex((s) => s.id === patch.id)
        if (idx === -1 && patch.op === "add" && patch.payload) {
            next.sections = [
                ...next.sections,
                patch.payload as unknown as AiDocument["sections"][number],
            ]
            return next
        }
        if (idx >= 0 && patch.payload) {
            next.sections = next.sections.map((s, i) =>
                i === idx ? ({ ...s, ...patch.payload } as typeof s) : s
            )
        }
        return next
    }

    if (target === "element") {
        const sectionId = patch.sectionId
        if (!sectionId || !patch.id) return next
        next.sections = next.sections.map((section) => {
            if (section.id !== sectionId) return section
            if (patch.op === "remove") {
                return {
                    ...section,
                    elements: section.elements.filter((e) => e.id !== patch.id),
                }
            }
            const elIdx = section.elements.findIndex((e) => e.id === patch.id)
            if (elIdx === -1 && patch.op === "add" && patch.payload) {
                return {
                    ...section,
                    elements: [
                        ...section.elements,
                        patch.payload as unknown as (typeof section.elements)[number],
                    ],
                }
            }
            if (elIdx >= 0 && patch.payload) {
                return {
                    ...section,
                    elements: section.elements.map((el, i) =>
                        i === elIdx ? ({ ...el, ...patch.payload } as typeof el) : el
                    ),
                }
            }
            return section
        })
    }

    return next
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
    aiDocsByFrameId: {},
    userEditedByFrameId: {},

    setCanvas: (canvas) => set({ canvas }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    addFrame: (frame) =>
        set((state) => ({
            frames: [
                ...state.frames,
                {
                    ...frame,
                    status: frame.status ?? "idle",
                    version: frame.version ?? 0,
                    lastPatchedAt: frame.lastPatchedAt ?? Date.now(),
                },
            ],
        })),
    setActiveFrame: (id) => set({ activeFrameId: id }),
    updateFrame: (id, data) =>
        set((state) => ({
            frames: state.frames.map((f) => (f.id === id ? { ...f, ...data } : f)),
        })),

    addSection: (sketchFrame, aiFrame) => set((state) => ({
        frames: [...state.frames, sketchFrame, aiFrame]
    })),

    setSelectedObject: (obj) => set({ selectedObject: obj }),

    setDefaultTextObject: (text) => set({ defaultTextObject: text }),

    deleteFrame: (id) =>
        set((state) => {
            const frameToDelete = state.frames.find((f) => f.id === id)
            const partnerId = frameToDelete?.linkedFrameId

            const frameIdsToDelete = new Set([id, partnerId].filter(Boolean) as string[])
            const nextAiDocs = Object.fromEntries(
                Object.entries(state.aiDocsByFrameId).filter(
                    ([frameId]) => !frameIdsToDelete.has(frameId)
                )
            )
            const nextEdited = Object.fromEntries(
                Object.entries(state.userEditedByFrameId).filter(
                    ([frameId]) => !frameIdsToDelete.has(frameId)
                )
            )

            return {
                frames: state.frames.filter(
                    (f) => f.id !== id && f.id !== partnerId
                ),
                activeFrameId: state.activeFrameId === id ? null : state.activeFrameId,
                aiDocsByFrameId: nextAiDocs,
                userEditedByFrameId: nextEdited,
            }
        }),

    setAiDoc: (frameId, doc) =>
        set((state) => ({
            aiDocsByFrameId: {
                ...state.aiDocsByFrameId,
                [frameId]: doc,
            },
            frames: state.frames.map((f) =>
                f.id === frameId
                    ? {
                        ...f,
                        status: doc.status,
                        version: doc.version,
                        lastPatchedAt: doc.updatedAt,
                    }
                    : f
            ),
        })),

    applyAiPatch: (frameId, patch) =>
        set((state) => {
            const currentDoc = state.aiDocsByFrameId[frameId]
            if (!currentDoc) return state
            const nextDoc = applyPatchToDoc(currentDoc, patch)
            return {
                aiDocsByFrameId: {
                    ...state.aiDocsByFrameId,
                    [frameId]: nextDoc,
                },
                frames: state.frames.map((f) =>
                    f.id === frameId
                        ? {
                            ...f,
                            version: nextDoc.version,
                            lastPatchedAt: nextDoc.updatedAt,
                        }
                        : f
                ),
            }
        }),

    setFrameLocked: (id, locked) =>
        set((state) => ({
            frames: state.frames.map((f) => (f.id === id ? { ...f, locked } : f)),
        })),

    markUserEdited: (frameId, target) =>
        set((state : any) => {
            const current = state.userEditedByFrameId[frameId] ?? {
                sections: {},
                elements: {},
            }
            const next =
                target.type === "section"
                    ? {
                        ...current,
                        sections: { ...current.sections, [target.id]: true },
                    }
                    : {
                        ...current,
                        elements: { ...current.elements, [target.id]: true },
                    }
            return {
                userEditedByFrameId: {
                    ...state.userEditedByFrameId,
                    [frameId]: next,
                },
            }
        }),

    clearUserEdits: (frameId) =>
        set((state) => ({
            userEditedByFrameId: {
                ...state.userEditedByFrameId,
                [frameId]: { sections: {}, elements: {} },
            },
        })),
}))
