'use client'

import { useCanvasStore } from '../../../lib/store/canvasStore'
import fabric from 'fabric'

function getScreenBounds(
    canvas: fabric.Canvas,
    obj: fabric.Object
) {
    obj.setCoords()

    const rect = obj.getBoundingRect()
    const vpt = canvas.viewportTransform!

    return {
        left: rect.left * vpt[0] + vpt[4],
        top: rect.top * vpt[3] + vpt[5],
        width: rect.width * vpt[0],
        height: rect.height * vpt[3],
    }
}

export default function SelectionOverlay() {
    const { canvas, selectedObject } = useCanvasStore()

    if (!canvas || !selectedObject) return null

    const { left, top, width, height } =
        getScreenBounds(canvas, selectedObject)

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left,
                top,
                width,
                height,
                border: '1px solid #2563eb',
                boxSizing: 'border-box',
            }}
        >
            <Handle pos="tl" />
            <Handle pos="tr" />
            <Handle pos="bl" />
            <Handle pos="br" />
        </div>
    )
}

function Handle({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
    const map = {
        tl: { top: -4, left: -4 },
        tr: { top: -4, right: -4 },
        bl: { bottom: -4, left: -4 },
        br: { bottom: -4, right: -4 },
    }

    return (
        <div
            style={{
                position: 'absolute',
                width: 8,
                height: 8,
                background: '#fff',
                border: '1px solid #2563eb',
                ...map[pos],
            }}
        />
    )
}
