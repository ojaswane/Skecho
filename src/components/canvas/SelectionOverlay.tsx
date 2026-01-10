'use client'

import { useCanvasStore } from '../../../lib/store/canvasStore'
import fabric from 'fabric'
import { useEffect, useState } from 'react'

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
    const [, force] = useState(0)

    useEffect(() => {
        if (!canvas || !selectedObject) return
        const update = () => force(v => v + 1)

        canvas.on('object:moving', update)
        canvas.on('object:scaling', update)
        canvas.on('object:rotating', update)
        canvas.on('mouse:wheel', update)
        canvas.on('after:render', update)

        return () => {
            canvas.off('object:moving', update)
            canvas.off('object:scaling', update)
            canvas.off('object:rotating', update)
            canvas.off('mouse:wheel', update)
            canvas.off('after:render', update)
        }
    }, [canvas, selectedObject])

    if (!canvas || !selectedObject) return null

    const { left, top, width, height } =
        getScreenBounds(canvas, selectedObject)

    const rotateOffset = 28

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
            {/* rotation */}
            <div
                style={{
                    position: 'absolute',
                    top: -rotateOffset + 8,
                    left: '50%',
                    width: 1,
                    height: rotateOffset - 8,
                    background: '#2563eb',
                    transform: 'translateX(-50%)',
                }}
            />

            {/* rotation handle */}
            <Handle pos="mtr" offset={rotateOffset} />

            {/* corner handles */}
            <Handle pos="tl" />
            <Handle pos="tr" />
            <Handle pos="bl" />
            <Handle pos="br" />

            {/* edge-mid handles */}
            <Handle pos="mr" />
            <Handle pos="ml" />
        </div>
    )
}

/* =========================
   HANDLE COMPONENT
========================= */

function Handle({
    pos,
    offset = 0,
}: {
    pos:
    | 'tl'
    | 'tr'
    | 'mr'
    | 'br'
    | 'bl'
    | 'ml'
    | 'mtr'
    offset?: number
}) {
    const size = 8
    const half = size / 2

    const map: Record<string, React.CSSProperties> = {
        tl: { top: -half, left: -half },
        tr: { top: -half, right: -half },
        mr: { top: '50%', right: -half, transform: 'translateY(-50%)' },
        br: { bottom: -half, right: -half },
        bl: { bottom: -half, left: -half },
        ml: { top: '50%', left: -half, transform: 'translateY(-50%)' },

        // rotation
        mtr: {
            top: -offset - half,
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '50%',
        },
    }

    return (
        <div
            style={{
                position: 'absolute',
                width: size,
                height: size,
                background: '#fff',
                border: '1px solid #2563eb',
                boxSizing: 'border-box',
                cursor: 'pointer',
                ...map[pos],
            }}
        />
    )
}