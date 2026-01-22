'use client'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import { Text } from 'fabric'
import React, { useEffect, useState } from 'react'
import { CircleChevronRight, ImagePlus, Sparkles } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const DEFAULT_TEXT = {
    text: "Sketch Your Idea Here!",
    fontSize: 65,
    charSpacing: -70,
    fill: "#000",
    fontFamily: "arial"
}

export default function DefaultText() {
    const canvas = useCanvasStore(s => s.canvas)
    const frames = useCanvasStore(s => s.frames)
    const [, forceUpdate] = useState(0)

    const [hasUserStarted, setHasUserStarted] = useState(false)

    const GenerateFromText = async () => {
        const res = await fetch("http://localhost:3001/generate", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                source: "text",
                prompt: "Login screen with email and password"
            })
        })
        console.log(await res.json())
    }

    // Sync overlay with zoom / pan
    useEffect(() => {
        if (!canvas) return
        const update = () => forceUpdate(n => n + 1)
        canvas.on('after:render', update)
        canvas.on('mouse:wheel', update)
        return () => {
            canvas.off('after:render', update)
            canvas.off('mouse:wheel', update)
        }
    }, [canvas])

    // helper: count real user objects
    const getUserObjectCount = () => {
        if (!canvas) return 0
        return canvas.getObjects().filter(obj =>
            !obj.get("isPlaceholder") &&
            !obj.get("isFrame")
        ).length
    }

    // Detect real user actions
    useEffect(() => {
        if (!canvas) return

        const onUserAction = (e: any) => {
            const obj = e?.target
            if (!obj) return
            if (obj.get("isPlaceholder")) return
            if (obj.get("isFrame")) return

            setHasUserStarted(true)

            canvas.getObjects().forEach(o => {
                if (o.get("isPlaceholder")) canvas.remove(o)
            })

            canvas.renderAll()
        }

        const onMouseDown = (opt: any) => {
            if (opt.target) onUserAction(opt)
        }

        canvas.on("object:added", onUserAction)
        canvas.on("mouse:down", onMouseDown)
        canvas.on("path:created", onUserAction)

        return () => {
            canvas.off("object:added", onUserAction)
            canvas.off("mouse:down", onMouseDown)
            canvas.off("path:created", onUserAction)
        }
    }, [canvas])

    // show overlay again when canvas is empty
    useEffect(() => {
        if (!canvas) return

        const onObjectRemoved = () => {
            const count = getUserObjectCount()

            if (count === 0) {
                setHasUserStarted(false)
            }
        }

        canvas.on("object:removed", onObjectRemoved)
        canvas.on("object:modified", onObjectRemoved)

        return () => {
            canvas.off("object:removed", onObjectRemoved)
            canvas.off("object:modified", onObjectRemoved)
        }
    }, [canvas])

    // Add default placeholder text
    useEffect(() => {
        if (!canvas || frames.length === 0 || hasUserStarted) return

        const frame = frames[0]

        canvas.getObjects().forEach(obj => {
            if (obj.get("isPlaceholder")) canvas.remove(obj)
        })

        const placeholder = new Text(DEFAULT_TEXT.text, {
            left: frame.left + frame.width / 2,
            top: frame.top + frame.height / 2,
            originX: "center",
            originY: "center",
            fontSize: DEFAULT_TEXT.fontSize,
            fill: DEFAULT_TEXT.fill,
            selectable: false,
            evented: false,
            charSpacing: DEFAULT_TEXT.charSpacing,
            fontFamily: DEFAULT_TEXT.fontFamily
        })

        placeholder.set("frameId", frame.id)
        placeholder.set("isPlaceholder", true)

        canvas.add(placeholder)
        canvas.renderAll()

        useCanvasStore.getState().setDefaultTextObject(placeholder)
    }, [canvas, frames, hasUserStarted])

    // Remove placeholder when user edits text
    useEffect(() => {
        if (!canvas) return
        const handler = (e: any) => {
            const obj = e.target
            if (obj?.get("isPlaceholder")) {
                obj.set("isPlaceholder", false)
                canvas.renderAll()
            }
        }
        canvas.on("text:changed", handler)
        return () => canvas.off("text:changed", handler)
    }, [canvas])

    // Overlay visible only when canvas is empty
    if (!canvas || frames.length === 0 || hasUserStarted) return null

    const frame = frames[0]
    const zoom = canvas.getZoom()
    const vpt = canvas.viewportTransform!

    const centerY = frame.top + frame.height / 2
    const x = (frame.left + frame.width / 2) * vpt[0] + vpt[4]
    const y = (frame.top + centerY) * vpt[3] + vpt[5]

    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, 0) scale(${zoom})`,
                transformOrigin: 'top center',
                pointerEvents: 'auto',
                whiteSpace: 'nowrap'
            }}
            className="rounded-full fixed flex items-center gap-2 p-4 bg-black/80 hover:bg-black/70 cursor-pointer"
        >
            <Dialog>
                <DialogTrigger className="flex items-center gap-2 text-white px-5 py-2 text-4xl tracking-tighter">
                    Type your prompt instead
                    <CircleChevronRight className="w-5 h-5" />
                </DialogTrigger>

                <DialogContent className="bg-[#1e1e1e] border border-white/10 rounded-3xl p-6 w-[420px] text-white">
                    <DialogHeader>
                        <div className="text-3xl tracking-tighter leading-tight">
                            Great! Type your<br />prompt here.
                        </div>
                    </DialogHeader>

                    <div className="mt-6 flex flex-col gap-3">
                        <input
                            placeholder="Idea Title (eg. SaaS App)"
                            className="w-2/3 rounded-full bg-white/10 px-4 py-2 outline-none"
                        />

                        <Textarea
                            placeholder="Type here..."
                            className="bg-white/10 border-0 rounded-2xl"
                        />

                        <div className="flex gap-2 mt-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="flex w-full items-center gap-2 rounded-full border border-white/20 px-4 py-2 hover:bg-white/10">
                                        <ImagePlus className="w-4 h-4" />
                                        Inspiration Image
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Add your inspired image
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={GenerateFromText}
                                        className="flex w-full items-center justify-center gap-2 rounded-full bg-white text-black px-5 py-2 font-medium">
                                        <Sparkles className="w-4 h-4" />
                                        Generate
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Generate wireframe
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}