'use client'

import React, { useEffect } from 'react'
import * as fabric from 'fabric'
import { Sparkles, ImagePlus } from 'lucide-react'

import { useCanvasStore } from '../../../../lib/store/canvasStore'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import render from '@/lib/render/renderWireframe'
import extractCanvasData from '../../../lib/render/extractCanvas'

type WireframeElement = {
    type: string
    [key: string]: any
}

const FramesOverlay = ({ frame }: any) => {
    const canvas = useCanvasStore((s) => s.canvas)
    if (!canvas) return null

    /* ------------------ AI GENERATION ------------------ */
    const GenerateTypeSketch = async () => {
        const canvasData = extractCanvasData()

        const res = await fetch('http://localhost:3001/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'sketch',
                payload: { objects: canvasData },
            }),
        })

        const data = await res.json()
        const elements: WireframeElement[] = Array.isArray(data?.elements)
            ? data.elements
            : []

        render(canvas, elements)
    }

    /* ------------------ UTILS ------------------ */
    function canvasToScreen(canvas: fabric.Canvas, x: number, y: number) {
        const vpt = canvas.viewportTransform!
        return {
            x: x * vpt[0] + vpt[4],
            y: y * vpt[3] + vpt[5],
        }
    }

    const [, forceUpdate] = React.useState(0)

    useEffect(() => {
        const update = () => forceUpdate((n) => n + 1)

        canvas.on('mouse:wheel', update)
        canvas.on('object:moving', update)
        canvas.on('after:render', update)

        return () => {
            canvas.off('mouse:wheel', update)
            canvas.off('object:moving', update)
            canvas.off('after:render', update)
        }
    }, [canvas])

    const zoom = canvas.getZoom()
    const pos = canvasToScreen(canvas, frame.left, frame.top)

    const BAR_HEIGHT = 44
    const BAR_GAP = 18

    /* ------------------ BADGE ------------------ */
    const renderBadge = () => {
        const map: Record<string, string> = {
            idea: 'Idea',
            wireframe: 'Wireframe',
            final: 'Final',
        }

        return (
            <Badge className="bg-white/15 text-lg text-white">
                {map[frame.badge] ?? 'Idea'}
            </Badge>
        )
    }

    /* ------------------ FRAME SIZE ------------------ */
    const HandleFrameSize = (value: string) => {
        const fabricFrame = canvas
            .getObjects()
            .find((obj) => (obj as any).data?.id === frame.id)

        if (!fabricFrame) return

        let width = frame.width
        let height = frame.height

        if (value === 'Desktop') {
            width = 1440
            height = 900
        }

        if (value === 'Tablet') {
            width = 768
            height = 1024
        }

        if (value === 'Mobile') {
            width = 390
            height = 844
        }

        fabricFrame.set({ width, height, scaleX: 1, scaleY: 1 })
        fabricFrame.setCoords()
        canvas.requestRenderAll()

        useCanvasStore.getState().updateFrame(frame.id, { width, height })
    }

    /* ------------------ UI ------------------ */
    return (
        <div
            className="absolute pointer-events-auto"
            style={{
                left: pos.x,
                top: pos.y - (BAR_HEIGHT + BAR_GAP) * zoom,
            }}
        >
            <div
                style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: frame.width,
                }}
            >
                <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl bg-black/70 text-white text-sm">

                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                        <Select defaultValue="Desktop" onValueChange={HandleFrameSize}>
                            <SelectTrigger className="p-3 rounded-full bg-white/10 border-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e1e1e] text-white">
                                <SelectItem value="Desktop">Desktop</SelectItem>
                                <SelectItem value="Tablet">Tablet</SelectItem>
                                <SelectItem value="Mobile">Mobile</SelectItem>
                            </SelectContent>
                        </Select>

                        {renderBadge()}

                        <Separator orientation="vertical" className="h-5 bg-white/20" />

                        <input
                            placeholder="Project name"
                            className="bg-white/10 px-3 py-1.5 rounded-md outline-none"
                        />

                        <input
                            placeholder="Notes"
                            className="bg-white/10 px-3 py-1.5 rounded-md outline-none"
                        />
                    </div>

                    {/* RIGHT */}
                    <div className="flex gap-2">
                        <label className="px-3 py-1.5 flex items-center gap-2 rounded-md bg-white/20 cursor-pointer">
                            <ImagePlus className="w-4 h-4" />
                            Inspiration
                            <input type="file" multiple hidden />
                        </label>

                        <button
                            onClick={GenerateTypeSketch}
                            className="px-3 py-1.5 flex items-center gap-2 rounded-md bg-white text-black"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FramesOverlay
