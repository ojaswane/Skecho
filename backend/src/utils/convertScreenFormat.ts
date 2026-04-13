// Convert new semantic screens to frontend-compatible format

interface SemanticScreen {
    id: string
    name: string
    layout: string
    sections: Record<string, any>
}

interface FrontendScreen {
    id: string
    name: string
    frameId?: string
    elements: Array<{
        id: string
        role?: string
        semantic?: string
        col: number
        row: number
        span: number
        rowSpan: number
        type?: string
        blocks?: any[]
    }>
}

export function convertSemanticScreenToFrontend(
    screen: SemanticScreen,
    frameId?: string
): FrontendScreen {
    const elements: any[] = []
    const sections = screen.sections || {}
    let row = 1

    // Sidebar
    if (sections.sidebar?.items) {
        elements.push({
            id: 'sidebar',
            type: 'sidebar',
            role: 'supporting',
            semantic: 'sidebar',
            col: 1,
            row: 1,
            span: 2,
            rowSpan: 8,
            blocks: [{ id: 'sidebar-block', kind: 'body_text' }],
        })
    }

    // Header
    const contentCol = sections.sidebar ? 3 : 1
    const contentSpan = 12 - (sections.sidebar ? 2 : 0)

    if (sections.header) {
        elements.push({
            id: 'header',
            type: 'header',
            role: 'dominant',
            semantic: 'header',
            col: contentCol,
            row: 1,
            span: contentSpan,
            rowSpan: 1,
            blocks: [{ id: 'header-block', kind: 'title_text' }],
        })
        row = 2
    }

    // Content items
    if (sections.content?.items) {
        const items = sections.content.items || []
        const itemsPerRow = 2
        let gridRow = row

        items.forEach((item: any, idx: number) => {
            if (idx > 0 && idx % itemsPerRow === 0) {
                gridRow += 2
            }

            const colOffset = (idx % itemsPerRow) * Math.ceil(contentSpan / itemsPerRow)

            elements.push({
                id: item.id || `item-${idx}`,
                type: item.type || 'card',
                role: 'supporting',
                semantic: item.type,
                col: contentCol + colOffset,
                row: gridRow,
                span: Math.ceil(contentSpan / itemsPerRow),
                rowSpan: 2,
                blocks: [
                    { id: `${item.id}-title`, kind: 'title_text' },
                    { id: `${item.id}-content`, kind: 'body_text' },
                ],
            })
        })
    }

    return {
        id: screen.id,
        name: screen.name,
        frameId,
        elements,
    }
}

export function convertSemanticScreensToFrontend(
    screens: SemanticScreen[],
    frameId?: string
): FrontendScreen[] {
    return screens.map((screen) => convertSemanticScreenToFrontend(screen, frameId))
}
