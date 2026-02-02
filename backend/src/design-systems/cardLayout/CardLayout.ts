import SemanticVisualMap from "../sematicMap/SematicMaps"
import type { SemanticBlock, LaidOutBlock } from "../../../lib/types"

export function layoutCard(
    blocks: SemanticBlock[],
    cardWidth: number,
    padding = 16
): LaidOutBlock[] {
    let y = padding
    const objects: LaidOutBlock[] = []

    for (const block of blocks) {
        const rule = SemanticVisualMap[block.kind]
        if (!rule) continue

        const width =
            rule.widthPercent
                ? rule.widthPercent * (cardWidth - padding * 2)
                : rule.size ?? cardWidth - padding * 2

        const height = rule.height ?? 12

        objects.push({
            id: block.id,
            left: padding,
            top: y,
            width,
            height,
            rule
        })

        y += height + (rule.marginBottom ?? 8)

        if (rule.repeat) {
            y += (height + (rule.gap ?? 6)) * (rule.repeat - 1)
        }
    }

    return objects
}