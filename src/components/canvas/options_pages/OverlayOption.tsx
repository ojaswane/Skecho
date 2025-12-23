'use client'
import React, { useEffect } from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import * as fabric from 'fabric';
import { Sparkles } from 'lucide-react';


const FramesOverlay = ({ frame }: any) => {
    const canvas = useCanvasStore((s) => s.canvas)
    if (!canvas) return null


    //Canvas handles infinite space and transformations.
    // HTML handles UI.
    // I sync them using the canvas transformation matrix so the UI appears locked to frames during zoom and pan.

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
    const BAR_HEIGHT = 44
    const BAR_GAP = 12 //margin

    return (

        <div
            className="absolute pointer-events-auto "
            style={{
                left: pos.x,
                top: pos.y - (BAR_HEIGHT + BAR_GAP) * zoom,
            }}
        >
            {/* SCALE LAYER */}
            <div
                style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    width: frame.width,
                }}
            >
                {/* TOP BAR */}
                <div className="flex items-center justify-between mb-2 gap-2 px-3 py-2 rounded-lg bg-black/70 text-white text-xl tracking-tight">
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
                        <button className="px-2 py-1 rounded flex items-center gap-2 bg-white text-black">
                            <Sparkles className="w-5" />
                            Generate Wireframe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FramesOverlay