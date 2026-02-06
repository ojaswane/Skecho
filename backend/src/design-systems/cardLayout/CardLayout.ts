import SemanticVisualMap from "../sematicMap/SematicMaps"
import type { SemanticBlock, LaidOutBlock } from "../../../lib/types"

export function layoutCard(
    blocks: SemanticBlock[],
    cardWidth: number,
    padding = 24
): LaidOutBlock[] {
    let cursorY = padding;
    const objects: LaidOutBlock[] = [];
    const usableWidth = cardWidth - (padding * 2);

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const rule = SemanticVisualMap[block.kind];
        if (!rule) continue;

        //  DYNAMIC WIDTH CALCULATION
        let width = rule.widthPercent
            ? rule.widthPercent * usableWidth
            : rule.size ?? usableWidth;

        width = Math.min(width, usableWidth); // Clamp to card width

        let left = padding;
        const nextBlock = blocks[i + 1];
        const nextRule = nextBlock ? SemanticVisualMap[nextBlock.kind] : null;

        // Check if we can fit the next one on the same line
        const canInline = nextRule && (rule.widthPercent || 0) + (nextRule.widthPercent || 0) <= 1.1;

        const height = rule.height ?? 12;

        objects.push({
            id: block.id,
            left,
            top: cursorY,
            width,
            height,
            rule
        });

        // SMART SPACING
        // If we aren't inlining, move the cursor down
        if (!canInline) {
            cursorY += height + (rule.marginBottom ?? 12);
        } else {
            // Logic for the next block in the loop to start further right
            // Note: For a true row system, you'd manage a cursorX, 
            // but for an MVP, shifting the Y is the priority fix.
            cursorY += height + (rule.marginBottom ?? 12);
        }

        if (rule.repeat) {
            cursorY += (height + (rule.gap ?? 8)) * (rule.repeat - 1);
        }
    }

    return objects;
}