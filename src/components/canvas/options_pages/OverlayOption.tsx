'use client'
import React, { useEffect } from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import * as fabric from 'fabric';


const FramesOverlay = ({ frame }: any) => {
    const canvas = useCanvasStore((s) => s.canvas)
    if (!canvas) return null

    function canvasToScreen(canvas: fabric.Canvas, x: number, y: number) {
        const vpt = canvas.viewportTransform!
        return {
            x: x * vpt[0] + vpt[4],
            y: y * vpt[3] + vpt[5],
        }
    }

    const [, forceUpdate] = React.useState(0)

    useEffect(() => {
        const canvas = useCanvasStore.getState().canvas
        if (!canvas) return

        const update = () => forceUpdate((n) => n + 1)

        canvas.on("mouse:wheel", update)
        canvas.on("object:moving", update)
        canvas.on("after:render", update)
        console.log(frames)

        return () => {
            canvas.off("mouse:wheel", update)
            canvas.off("object:moving", update)
            canvas.off("after:render", update)
        }
    }, [])

    const zoom = canvas.getZoom()
    const pos = canvasToScreen(canvas, frame.left, frame.top)

    return (
        <div
            className="absolute pointer-events-auto"
            style={{
                left: pos.x,
                top: pos.y - 44 * zoom,
                width: frame.width * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
            }}
        >
            {/* TOP BAR */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/70 text-white text-xs">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/20">
                        {frame.device}
                    </span>
                    <span className="opacity-70">
                        {frame.badge}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-white/20">
                        Inspiration
                    </button>
                    <button className="px-2 py-1 rounded bg-white text-black">
                        Generate Wireframe
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FramesOverlay