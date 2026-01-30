'use client'

import React, { use, useEffect, useState } from 'react'
import * as fabric from 'fabric'
import { ImagePlus } from 'lucide-react'
import type { ArtboardFrame } from '../../../../lib/store/canvasStore'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import { Badge } from '@/components/ui/badge'
import { Screen } from "../../../../lib/store/canvasStore"
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import render from '../../../lib/render/renderWireframe'
import extractCanvasData from '@/lib/render/extractCanvasData'
import GenerateButton from '@/components/ui/generateButton'
import renderFromAI from '@/lib/canvas/RenderAiPatterns'

type WireframeElement = {
    type: string
    [key: string]: any
}

const FramesOverlay = ({ frame }: any) => {
    const canvas = useCanvasStore((s) => s.canvas)
    const [, forceUpdate] = useState(0)
    const [loader, setloader] = useState(false)
    const [userPrompt, setPrompt] = useState('')
    const loadingFrameRef = React.useRef<fabric.Rect | null>(null)
    const shimmerRef = React.useRef<fabric.Rect | null>(null)
    const animationRef = React.useRef<number | null>(null)

    /* ------------------ UTILS ------------------ */
    function canvasToScreen(canvas: fabric.Canvas, x: number, y: number) {
        const vpt = canvas.viewportTransform!
        return {
            x: x * vpt[0] + vpt[4],
            y: y * vpt[3] + vpt[5],
        }
    }

    useEffect(() => {
        if (!canvas) return

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

    /* -------------------AI Loading --------------------*/

    const createLoadingOverlay = () => {
        if (!canvas) return

        const fabricFrame = canvas
            .getObjects()
            .find(
                (obj: any) =>
                    obj.get?.('isFrame') && obj.get?.('frameId') === frame.id
            )

        if (!fabricFrame) {
            console.log("Frame not found for loader")
            return
        }

        const themeColor = '#6366f1'
        const left = fabricFrame.left!
        const top = fabricFrame.top!
        const width = fabricFrame.width! * fabricFrame.scaleX!
        const height = fabricFrame.height! * fabricFrame.scaleY!

        // Base overlay (transparent background)
        const loadingFrame = new fabric.Rect({
            left,
            top,
            width,
            height,
            rx: 8,
            ry: 8,
            fill: themeColor,
            opacity: 0.1,
            stroke: themeColor,
            strokeWidth: 1,
            selectable: false,
            evented: false,
        })

        // Shimmer bar that grows from top
        const shimmer = new fabric.Rect({
            left,
            top,
            width,
            height: 0,// Start at 0 height
            rx: 8,
            ry: 8,
            fill: themeColor,
            opacity: 0.25,
            selectable: false,
            evented: false,
        })

        canvas.add(loadingFrame)
        canvas.add(shimmer)
        canvas.bringObjectToFront(loadingFrame)
        canvas.bringObjectToFront(shimmer)
        loadingFrame.set('excludeFromExport', true)
        shimmer.set('excludeFromExport', true)

        // Animate height from top to bottom
        const duration = 900 // milliseconds
        let start = performance.now()

        const animate = (time: number) => {
            const elapsed = time - start
            const progress = Math.min(elapsed / duration, 1)
            shimmer.set({ height: height * progress })
            canvas.requestRenderAll()
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate)
            } else {
                // loop the animation
                start = performance.now()
                animationRef.current = requestAnimationFrame(animate)
            }
        }

        animationRef.current = requestAnimationFrame(animate)

        loadingFrameRef.current = loadingFrame
        shimmerRef.current = shimmer
    }


    const removeLoadingOverlay = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }

        if (!canvas) return

        const shimmer = shimmerRef.current
        const loadingFrame = loadingFrameRef.current

        if (shimmer) {
            shimmer.animate({ opacity: 0 }, {
                duration: 150,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: () => canvas.remove(shimmer),
            })
        }

        if (loadingFrame) {
            loadingFrame.animate({ opacity: 0 }, {
                duration: 150,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: () => canvas.remove(loadingFrame),
            })
        }

        shimmerRef.current = null
        loadingFrameRef.current = null
    }


    /* ------------------ AI GENERATION ------------------ */

    function aiToScreens(
        aiResponse: any,
        targetFrame: ArtboardFrame
    ): Screen[] {
        if (!aiResponse?.screens?.length) return []

        return aiResponse.screens.map((s: any) => ({
            id: s.id ?? crypto.randomUUID(),
            name: s.name ?? "AI Screen",

            frame: {
                id: targetFrame.id,
                width: targetFrame.width,
                height: targetFrame.height,
            },

            frames: (s.frames ?? []).map((el: any) => ({
                id: el.id ?? crypto.randomUUID(),
                type: el.type ?? "card",
                role: el.role,
                col: el.col ?? 1,
                row: el.row ?? 1,
                span: el.span ?? 1,
                rowSpan: el.rowSpan ?? 1,
            })),
        }))
    }

    const GenerateTypeSketch = async () => {
        if (!canvas) return

        const canvasData = extractCanvasData(canvas)

        if (!canvasData.length && !userPrompt.trim()) {
            console.warn("Nothing to generate")
            return
        }

        try {
            setloader(true)
            createLoadingOverlay()

            const res = await fetch("http://localhost:3001/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: "sketch",
                    prompt: userPrompt.trim(),
                    existingLayout: canvasData,
                    frame: {
                        width: frame.width,
                        height: frame.height,
                        type: frame.badge === "idea" ? "wireframe" : frame.badge,
                    },
                }),
            })

            const data = await res.json()
            console.log("AI response", data)

            canvas.discardActiveObject()

            const nextBadge: "wireframe" | "final" =
                frame.badge === "final" ? "final" : "wireframe"

            const { frame: newFrame, frameId } = createNewFrame({
                canvas,
                sourceFrame: frame,
                badge: nextBadge,
            })

            let screens = aiToScreens(data, newFrame)

            // feedback for AI
            if (!screens.length) {
                screens = [
                    {
                        id: crypto.randomUUID(),
                        name: "Fallback",
                        frame: {
                            id: frameId,
                            width: newFrame.width,
                            height: newFrame.height,
                        },
                        frames: [
                            {
                                id: crypto.randomUUID(),
                                type: "card",
                                col: 1,
                                row: 1,
                                span: 2,
                                rowSpan: 1,
                            },
                        ],
                    },
                ]
            }

            renderFromAI(canvas, screens)
            canvas.requestRenderAll()

            // Pan to new frame
            const fabricFrame = canvas
                .getObjects()
                .find(
                    (obj: any) =>
                        obj.get?.("isFrame") &&
                        obj.get?.("frameId") === frame.id
                )

            if (fabricFrame) {
                canvas.viewportTransform = [
                    1, 0, 0, 1,
                    -fabricFrame.left! + 100,
                    -fabricFrame.top! + 100,
                ]
                canvas.requestRenderAll()
            }

        } catch (err) {
            console.error("AI generation failed", err)
        } finally {
            removeLoadingOverlay()
            setloader(false)
        }
    }


    function createNewFrame({
        canvas,
        sourceFrame,
        badge,
    }: {
        canvas: fabric.Canvas
        sourceFrame: ArtboardFrame
        badge: 'wireframe' | 'final'
    }) {
        const id = crypto.randomUUID()
        const GAP = 600

        const frame: ArtboardFrame = {
            id,
            device: sourceFrame.device,
            badge,
            width: sourceFrame.width,
            height: sourceFrame.height,
            left: sourceFrame.left + sourceFrame.width + GAP,
            top: sourceFrame.top,
            locked: false,
        }

        const frameRect = new fabric.Rect({
            left: frame.left,
            top: frame.top,
            width: frame.width,
            height: frame.height,
            fill: '#f3f3f3',
            stroke: '#6366f1',
            selectable: true,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
        })

        frameRect.set('isFrame', true)
        frameRect.set('frameId', id)

        canvas.add(frameRect)

        frameRect.set({
            hasControls: false,
            hasBorders: false,
        })

        useCanvasStore.getState().addFrame(frame)

        return { frame, frameId: id }
    }



    useEffect(() => {
        canvas?.on('selection:created', (e) => {
            const sel = e.selected?.[0]
            if (sel && sel.type === 'activeSelection') {
                sel.clipPath = undefined
            }
        })

        canvas?.on('selection:updated', (e) => {
            const sel = e.selected?.[0]
            if (sel && sel.type === 'activeSelection') {
                sel.clipPath = undefined
            }
        })

    }, [canvas])

    if (!canvas) return null

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
                            onChange={((e) => setPrompt(e.target.value))}
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

                        <GenerateButton onClick={GenerateTypeSketch} >
                            {loader ? (
                                <span className="">
                                    Generating...
                                </span>
                            ) : (
                                <span className="">
                                    Generate Wireframe
                                </span>
                            )}
                        </GenerateButton>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FramesOverlay
