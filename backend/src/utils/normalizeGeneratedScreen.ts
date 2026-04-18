import type { AiSection } from "../realtime/protocol.js"
import { convertSemanticScreenToFrontend } from "./convertScreenFormat.js"

type GeneratedScreenLike = {
    id?: string
    name?: string
    layoutTree?: unknown
    sections?: Record<string, unknown>
    frames?: Array<{
        id?: string
        type?: string
        semantic?: string
        role?: string
        col?: number
        row?: number
        span?: number
        rowSpan?: number
        text?: string
        style?: Record<string, unknown>
    }>
}

function frameElementsToSection(screen: GeneratedScreenLike, frameId: string): AiSection {
    return {
        id: screen.id ?? "screen-1",
        frameId,
        name: screen.name ?? "Screen 1",
        layoutTree: screen.layoutTree as any,
        elements: (screen.frames || []).map((frame, index) => ({
            id: frame.id ?? `element-${index + 1}`,
            sectionId: screen.id ?? "screen-1",
            type: (frame.type as any) || "card",
            semantic: frame.semantic as any,
            role: frame.role,
            col: frame.col ?? 1,
            row: frame.row ?? 1,
            span: frame.span ?? 12,
            rowSpan: frame.rowSpan ?? 1,
            text: frame.text,
            style: frame.style,
        })),
    }
}

function semanticScreenToSection(screen: GeneratedScreenLike, frameId: string): AiSection {
    const converted = convertSemanticScreenToFrontend(screen as any, frameId)

    return {
        id: converted.id ?? screen.id ?? "screen-1",
        frameId,
        name: converted.name ?? screen.name ?? "Screen 1",
        layoutTree: screen.layoutTree as any,
        elements: converted.elements.map((element) => ({
            id: element.id,
            sectionId: converted.id ?? screen.id ?? "screen-1",
            type: (element.type as any) || "card",
            semantic: (element.semantic as any) || (element.type as any),
            role: element.role,
            col: element.col,
            row: element.row,
            span: element.span,
            rowSpan: element.rowSpan,
            style: { blocks: element.blocks ?? [] },
        })),
    }
}

export function normalizeGeneratedScreensToSections(
    screens: GeneratedScreenLike[],
    frameId: string
): AiSection[] {
    return screens.map((screen, index) => {
        const safeScreen = {
            id: screen?.id ?? `screen-${index + 1}`,
            name: screen?.name ?? `Screen ${index + 1}`,
            ...screen,
        }

        if (safeScreen.sections && typeof safeScreen.sections === "object") {
            return semanticScreenToSection(safeScreen, frameId)
        }

        return frameElementsToSection(safeScreen, frameId)
    })
}
