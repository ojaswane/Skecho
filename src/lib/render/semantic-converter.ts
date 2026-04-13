// Convert new semantic backend output to frontend AIScreen format

import { SemanticCanvasRenderer } from './semantic-renderer'
import * as fabric from 'fabric'

export interface SemanticBackendScreen {
    id: string
    name: string
    layout: 'sidebar' | 'full' | 'tabs'
    sections: Record<string, SemanticSection>
    metadata?: Record<string, any>
}

export interface SemanticSection {
    id: string
    type: 'sidebar' | 'header' | 'content' | 'footer'
    title?: string
    items?: SemanticComponent[]
}

export interface SemanticComponent {
    id: string
    type: string
    title?: string
    subtitle?: string
    content?: string
    value?: string
    change?: string
    icon?: string
    color?: string
    cols?: number
    rows?: number
    items?: any[]
}

// Convert sections-based structure to grid-based elements
export function convertSemanticToElements(screen: SemanticBackendScreen): any[] {
    const elements: any[] = []
    const sections = screen.sections
    let row = 1

    // Sidebar gets fixed position on left
    if (sections.sidebar) {
        elements.push({
            id: 'sidebar',
            type: 'sidebar',
            role: 'supporting',
            col: 1,
            row: 1,
            span: 2,
            rowSpan: 8,
            semantic: 'sidebar',
            component: sections.sidebar,
        })
    }

    // Header spans the content area
    const contentStartCol = sections.sidebar ? 3 : 1
    const contentSpan = 12 - (sections.sidebar ? 2 : 0)

    if (sections.header) {
        elements.push({
            id: 'header',
            type: 'header',
            role: 'dominant',
            col: contentStartCol,
            row: 1,
            span: contentSpan,
            rowSpan: 1,
            semantic: 'header',
            component: sections.header,
        })
        row = 2
    }

    // Content grid
    if (sections.content && sections.content.items) {
        const items = sections.content.items || []
        let colPosition = contentStartCol
        let gridRow = row
        const itemsPerRow = 2 // 2 items per row in content area

        items.forEach((item: any, idx: number) => {
            const colInRow = idx % itemsPerRow
            if (colInRow === 0 && idx > 0) {
                gridRow += 2
            }

            const span = Math.ceil(contentSpan / itemsPerRow)
            elements.push({
                id: item.id,
                type: item.type,
                role: 'supporting',
                col: contentStartCol + colInRow * span,
                row: gridRow,
                span,
                rowSpan: 2,
                semantic: item.type,
                component: item,
            })
        })
    }

    return elements
}

// Render semantic components directly to canvas using new renderer
export function renderSemanticScreen(
    canvas: fabric.Canvas,
    screen: SemanticBackendScreen,
    frameId: string,
    frame: { left: number; top: number; width: number; height: number },
    isDark: boolean = false
) {
    const renderer = new SemanticCanvasRenderer(isDark)
    const elements = convertSemanticToElements(screen)

    // Layout constants
    const padding = 20
    const sidebarWidth = screen.sections.sidebar ? 280 : 0
    const contentX = frame.left + padding + sidebarWidth
    const contentWidth = frame.width - sidebarWidth - padding * 2

    // Clear any previous renders in this frame
    const stale = canvas.getObjects().filter((o: any) => o.get?.('isAiGenerated') && o.get?.('frameId') === frameId)
    stale.forEach((o) => canvas.remove(o))

        // Render each component
        ; (screen.sections.sidebar?.items || []).forEach((item: any, idx: number) => {
            const y = frame.top + padding + idx * 60
            renderer.render(
                {
                    x: frame.left + padding,
                    y,
                    width: sidebarWidth - padding * 2,
                    height: 50,
                    canvas,
                    isDark,
                },
                item
            )
        })

    if (screen.sections.header) {
        renderer.render(
            {
                x: contentX,
                y: frame.top + padding,
                width: contentWidth,
                height: 80,
                canvas,
                isDark,
            },
            screen.sections.header
        )
    }

    // Content area
    const contentStartY = screen.sections.header
        ? frame.top + padding + 100
        : frame.top + padding

    const contentItems = screen.sections.content?.items || []
    const itemsPerRow = 2
    const itemWidth = (contentWidth - 16) / itemsPerRow
    const itemHeight = 200

    contentItems.forEach((item: any, idx: number) => {
        const row = Math.floor(idx / itemsPerRow)
        const col = idx % itemsPerRow

        const x = contentX + col * (itemWidth + 16)
        const y = contentStartY + row * (itemHeight + 16)

        renderer.render(
            {
                x,
                y,
                width: itemWidth,
                height: itemHeight,
                canvas,
                isDark,
            },
            item
        )
    })

    // Mark all objects as AI generated
    canvas.getObjects().forEach((obj: any) => {
        if (!obj.get?.('isAiGenerated')) {
            obj.set('isAiGenerated', true)
            obj.set('frameId', frameId)
        }
    })

    canvas.requestRenderAll()
}
