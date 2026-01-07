'use client'
import React, { useEffect } from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import * as fabric from 'fabric'
import { Sparkles, ImagePlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
        const update = () => forceUpdate(n => n + 1)
        canvas.on("mouse:wheel", update)
        canvas.on("object:moving", update)
        canvas.on("after:render", update)

        return () => {
            canvas.off("mouse:wheel", update)
            canvas.off("object:moving", update)
            canvas.off("after:render", update)
        }
    }, [canvas])

    const zoom = canvas.getZoom()
    const pos = canvasToScreen(canvas, frame.left, frame.top)

    const BAR_HEIGHT = 44
    const BAR_GAP = 18

    const renderBadge = () => {
        switch (frame.badge) {
            case 'idea':
                return (
                    <Badge className="bg-yellow-500/20 text-lg text-yellow-300">
                        Idea
                    </Badge>
                )
            case 'wireframe':
                return (
                    <Badge className="bg-blue-500/20 text-lg text-blue-300">
                        Wireframe
                    </Badge>
                )
            case 'final':
                return (
                    <Badge className="bg-green-500/20 text-lg text-green-300">
                        Final
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-yellow-500/20 text-lg text-yellow-300">
                        Idea
                    </Badge>
                )
        }
    }

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
                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-black/70 text-white text-lg tracking-tight">

                    {/* LEFT */}
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-lg bg-white/20">
                            {frame.device}
                        </span>

                        {renderBadge()}
                    </div>

                    {/* RIGHT */}
                    <div className="flex gap-2">
                        <button className="px-2 py-1 flex cursor-pointer gap-2 items-center rounded bg-white/20 hover:bg-white/30 transition">
                            <ImagePlus className="w-4" />
                            Inspiration
                        </button>

                        <button className="px-2 py-1 flex gap-2 cursor-pointer items-center rounded bg-white text-black hover:bg-white/90 transition">
                            <Sparkles className="w-4" />
                            Generate
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default FramesOverlay