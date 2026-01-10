'use client'

import { useCanvasStore } from '../../../lib/store/canvasStore'
import { getObjectScreenBounds } from '@/utils/getObjectScreenBounds'

const SelectionOverlay = () => {
    const { canvas, selectedObject } = useCanvasStore()

    if (!canvas || !selectedObject) return null

    const { left, top, width, height } =
        getObjectScreenBounds(canvas, selectedObject)

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
            {/* Handles */}
            <Handle pos="tl" />
            <Handle pos="tr" />
            <Handle pos="bl" />
            <Handle pos="br" />
        </div>
    )
}

export default SelectionOverlay

const Handle = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const base =
        'absolute w-[8px] h-[8px] bg-white border border-blue-600'

    const map = {
        tl: 'top-[-4px] left-[-4px]',
        tr: 'top-[-4px] right-[-4px]',
        bl: 'bottom-[-4px] left-[-4px]',
        br: 'bottom-[-4px] right-[-4px]',
    }

    return <div className={`${base} ${map[pos]}`} />
}
