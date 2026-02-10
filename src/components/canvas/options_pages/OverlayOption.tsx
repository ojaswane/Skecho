'use client'

import React, { useEffect, useState } from 'react'
import * as fabric from 'fabric'
import { Check, ImagePlus, X } from 'lucide-react'
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
import { AIScreen } from '../../../../lib/type'

type WireframeElement = {
    type: string
    [key: string]: any
}

const FramesOverlay = ({ frame }: any) => {
    const canvas = useCanvasStore((s) => s.canvas)
    const [, forceUpdate] = useState(0)
    const [loader, setloader] = useState(false)
    const [userPrompt, setPrompt] = useState('')
    const idMap = React.useRef<Record<string, string>>({});

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


    /* ------------------ AI GENERATION ------------------ */

    type ScreenWithElements = Screen & {
        elements: {
            id: string
            role?: string
            col: number
            row: number
            span: number
            rowSpan: number
            blocks: any[]
        }[]
    }

    function aiToScreens(
        aiResponse: any,
        targetFrame: ArtboardFrame
    ): ScreenWithElements[] {
        if (!aiResponse?.screens?.length) return []

        return aiResponse.screens.map((s: any) => ({
            id: s.id ?? crypto.randomUUID(),
            name: s.name ?? "AI Screen",
            frame: {
                id: targetFrame.id,
                width: targetFrame.width,
                height: targetFrame.height,
            },
            elements: (s.elements || s.frames || []).map((el: any) => ({
                id: el.id ?? crypto.randomUUID(),
                role: el.role,
                col: el.col ?? 1,
                row: el.row ?? 1,
                span: el.span ?? 1,
                rowSpan: el.rowSpan ?? 1,
                blocks: el.blocks ?? []
            })),
        }))
    }

    function screenToAIScreen(screens: ScreenWithElements[]): AIScreen[] {
        return screens.map((s) => ({
            id: s.id,
            name: s.name,
            frameId: s.frame.id,
            elements: s.elements.map((el) => ({
                id: el.id,
                role: el.role,
                col: el.col,
                row: el.row,
                span: el.span,
                rowSpan: el.rowSpan,
                // The renderer requires the blocks array
                blocks: (el.blocks || []).map((block: any) => ({
                    id: block.id ?? crypto.randomUUID(),
                    // Ensure kind matches the specific union type required
                    kind: block.kind ?? "body_text",
                })),
                type: (el as any).type ?? 'block'
            }))
        }))
    }


    const GenerateTypeSketch = async () => {
        if (!canvas) {
            console.error("Canvas not found")
            return
        }
        const canvasData = extractCanvasData(canvas)
        console.log('button is clicked')

        try {
            setloader(true)
            const parts: any[] = []

            const imageBase64 = canvas.toDataURL({
                format: "jpeg",
                quality: 0.05,
                multiplier: 0.05,
            })

            const response = await fetch("http://localhost:4000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: "sketch",
                    prompt: userPrompt.trim(),
                    imageBase64: imageBase64,
                    existingLayout: canvasData,
                    frame: {
                        width: frame.width,
                        height: frame.height,
                        type: frame.badge === "idea" ? "wireframe" : frame.badge,
                    },
                }),
            })

            if (!response.body) return
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                // Sometimes multiple JSON objects come in one chunk,
                // and sometimes one JSON object is split across two chunks.
                const lines = chunk.split("\n");

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

                    try {
                        const rawData = trimmedLine.replace("data: ", "");

                        if (rawData === "[DONE]") break;

                        const payload = JSON.parse(rawData);
                        console.log("FULL PAYLOAD RECEIVED:", payload);

                        // creation of frame
                        if (payload.type === "PLAN") {
                            console.log("Creating Ghost Frames:", payload.screens);
                            payload.screens.forEach((screenPlan: any) => {
                                const { frame: newFrame } = createNewFrame({
                                    canvas,
                                    sourceFrame: frame,
                                    badge: "wireframe",
                                    role: screenPlan.role || "suggestion"
                                });

                                idMap.current[screenPlan.id] = newFrame.id;
                            });
                        }

                        //Handle the ACTUAL CONTENT
                        if (payload.type === "SCREEN_DONE") {
                            const targetFrameId = idMap.current[payload.data.id];

                            if (!targetFrameId) {
                                console.warn("No pre-created frame found, rendering to current.");
                            }

                            const rawAiData = aiToScreens(
                                { screens: [payload.data] },
                                { ...frame, id: targetFrameId || frame.id }
                            );
                            const aiScreens = screenToAIScreen(rawAiData);

                            renderFromAI(canvas, aiScreens);
                            canvas.requestRenderAll();
                        }
                    } catch (e) {
                        console.error("Error parsing stream line:", trimmedLine, e);
                    }
                }
            }

        } catch (err) {
            console.error("Streaming failed", err)
        } finally {
            setloader(false)
        }
    }



    function createNewFrame({
        canvas,
        sourceFrame,
        badge,
        role = "refinement"
    }: {
        canvas: fabric.Canvas,
        sourceFrame: ArtboardFrame,
        badge: 'wireframe' | 'final',
        role?: "refinement" | "suggestion"
    }) {
        const id = crypto.randomUUID();
        const frames = useCanvasStore.getState().frames;
        const GAP = 150;

        // Smart positioning: Find the furthest right edge
        const rightMost = frames.reduce((max, f) => Math.max(max, f.left + f.width), sourceFrame.left + sourceFrame.width);

        const frame: ArtboardFrame = {
            id,
            device: sourceFrame.device,
            badge,
            width: sourceFrame.width,
            height: sourceFrame.height,
            left: rightMost + GAP,
            top: sourceFrame.top,
            locked: false,
        };

        const frameRect = new fabric.Rect({
            left: frame.left,
            top: frame.top,
            width: frame.width,
            height: frame.height,
            fill: role === "refinement" ? '#ffffff' : '#f8fafc',
            stroke: role === "refinement" ? '#6366f1' : '#cbd5e1',
            strokeWidth: 2,
            strokeDashArray: role === "suggestion" ? [10, 5] : [], // Dashed for suggestions
            opacity: role === "suggestion" ? 0.6 : 1,
            selectable: true,
        });

        frameRect.set('isFrame', true);
        frameRect.set('frameId', id);
        frameRect.set('role', role); // Store the role on the fabric object

        canvas.add(frameRect);
        useCanvasStore.getState().addFrame(frame);

        return { frame, frameId: id };
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





    const handleAcceptSuggestion = (frameId: string) => {
        if (!canvas) return;

        const fabricFrame = canvas.getObjects().find(
            (obj: any) => obj.get?.('isFrame') && obj.get?.('frameId') === frameId
        );

        if (fabricFrame) {
            fabricFrame.set({
                strokeDashArray: [],
                stroke: '#6366f1',
            });

            // Use the explicit animation config object
            const animOptions: any = {
                property: 'opacity',
                to: 1,
                duration: 300,
                easing: fabric.util.ease.easeOutQuart,
                onChange: () => canvas.requestRenderAll(),
            };

            fabricFrame.animate(animOptions);

            useCanvasStore.getState().updateFrame(frameId, {
                badge: 'wireframe'
            });
        }
    };

    const handleRejectSuggestion = (frameId: string) => {
        if (!canvas) return;

        // 1. Remove from Canvas with a fade-out
        const objectsToRemove = canvas.getObjects().filter(
            (obj: any) => obj.get?.('frameId') === frameId || obj.get?.('belongsToFrame') === frameId
        );

        objectsToRemove.forEach(obj => {
            obj.animate({
                property: 'opacity',
                to: 0,
                duration: 200,
                onChange: () => canvas.requestRenderAll(),
                onComplete: () => {
                    canvas.remove(obj);
                }
            } as any);
        });

        // 2. Remove from Store
        // (You'll need a deleteFrame action in your Zustand store)
        useCanvasStore.getState().deleteFrame(frameId);
    };

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

                        {
                            frame.role === 'suggestion' && (
                                <div className="absolute -top-12 left-0 w-full flex justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <button
                                        onClick={() => handleAcceptSuggestion(frame.id)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1"
                                    >
                                        <Check className="w-3 h-3" /> Keep Suggestion
                                    </button>
                                    <button
                                        onClick={() => handleRejectSuggestion(frame.id)}
                                        className="bg-white hover:bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium shadow-lg border border-red-100"
                                    >
                                        <X className="w-3 h-3" /> Discard
                                    </button>
                                </div>
                            )
                        }

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
