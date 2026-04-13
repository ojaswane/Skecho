// Convert new semantic screens to frontend-compatible format

interface SemanticScreen {
    id: string
    name: string
    layout: string
    sections: Record<string, any>
    metadata?: Record<string, any>
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
        blocks?: Array<{
            id: string
            kind: 'profile_image' | 'content_image' | 'title_text' | 'body_text' | 'meta_text' | 'primary_action'
        }>
    }>
}

function getBlocksForComponentType(componentType: string, componentId: string): Array<{ id: string; kind: string }> {
    const blockMap: Record<string, string[]> = {
        'metric-card': ['title_text', 'body_text', 'meta_text'],
        'chart': ['title_text', 'content_image'],
        'table': ['title_text', 'body_text'],
        'nav': ['title_text'],
        'header': ['title_text', 'body_text'],
        'sidebar': ['title_text'],
        'card': ['title_text', 'body_text'],
        'button': ['primary_action'],
        'list': ['body_text'],
        'section': ['title_text', 'body_text'],
    }

    const blockKinds = blockMap[componentType] || ['body_text']
    return blockKinds.map((kind, idx) => ({
        id: `${componentId}-block-${idx}`,
        kind: kind as any,
    }))
}

export function convertSemanticScreenToFrontend(
    screen: SemanticScreen,
    frameId?: string
): FrontendScreen {
    const elements: any[] = []
    const sections = screen.sections || {}
    let currentRow = 1

    // Sidebar - always on left (col 1-2)
    if (sections.sidebar?.items && sections.sidebar.items.length > 0) {
        const navItems = sections.sidebar.items || []
        const maxNavItems = Math.min(navItems.length, 6)
        const navRowSpan = Math.max(2, Math.ceil(maxNavItems / 2))

        elements.push({
            id: 'sidebar',
            type: 'sidebar',
            role: 'supporting',
            semantic: 'sidebar',
            col: 1,
            row: 1,
            span: 2,
            rowSpan: navRowSpan + 2,
            blocks: [{ id: 'sidebar-block', kind: 'body_text' }],
        })
    }

    // Header - spans content area width
    const hasLeftSidebar = sections.sidebar?.items && sections.sidebar.items.length > 0
    const contentColStart = hasLeftSidebar ? 3 : 1
    const contentSpan = 12 - (hasLeftSidebar ? 2 : 0)

    if (sections.header) {
        elements.push({
            id: 'header',
            type: 'header',
            role: 'dominant',
            semantic: 'header',
            col: contentColStart,
            row: 1,
            span: contentSpan,
            rowSpan: 1,
            blocks: [
                { id: 'header-title', kind: 'title_text' },
                { id: 'header-subtitle', kind: 'meta_text' },
            ],
        })
        currentRow = 2
    }

    // Content items - arranged in a 2-column grid
    if (sections.content?.items && sections.content.items.length > 0) {
        const contentItems = sections.content.items || []
        const itemsPerRow = 2
        let gridRow = currentRow
        let itemInRow = 0

        for (let idx = 0; idx < contentItems.length; idx++) {
            const item = contentItems[idx]

            // Calculate grid position
            if (itemInRow >= itemsPerRow) {
                gridRow += 3
                itemInRow = 0
            }

            const colWidth = Math.floor(contentSpan / itemsPerRow)
            const colStart = contentColStart + itemInRow * colWidth

            // Determine span and row span based on component type
            let itemSpan = colWidth
            let itemRowSpan = 2

            if (item.type === 'chart' || item.type === 'table') {
                itemSpan = contentSpan // Charts and tables span full width
                itemRowSpan = 3
                if (itemInRow > 0) {
                    gridRow += 3
                    itemInRow = 0
                }
            }

            elements.push({
                id: item.id || `content-item-${idx}`,
                type: item.type || 'card',
                role: item.type === 'chart' || item.type === 'table' ? 'dominant' : 'supporting',
                semantic: item.type,
                col: item.type === 'chart' || item.type === 'table' ? contentColStart : colStart,
                row: gridRow,
                span: item.type === 'chart' || item.type === 'table' ? contentSpan : itemSpan,
                rowSpan: itemRowSpan,
                blocks: getBlocksForComponentType(item.type || 'card', item.id || `item-${idx}`),
            })

            itemInRow++
        }
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
