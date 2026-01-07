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
    fill: "#000",
    fontFamily: "arial"
}

export default function DefaultText() {
    const canvas = useCanvasStore(s => s.canvas)
    const frames = useCanvasStore(s => s.frames)
    const [, forceUpdate] = useState(0)

    // Sync overlay with zoom/pan
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

    // Add placeholder text
    useEffect(() => {
        if (!canvas || frames.length === 0) return
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
            fontFamily: DEFAULT_TEXT.fontFamily
        })

        placeholder.set("isPlaceholder", true)
        canvas.add(placeholder)
        canvas.renderAll()
    }, [canvas, frames])

    if (!canvas || frames.length === 0) return null

    const frame = frames[0]
    const vpt = canvas.viewportTransform!

    const cx = frame.left + frame.width / 2
    const cy = frame.top + frame.height / 2 + 40

    const x = cx * vpt[0] + vpt[4]
    const y = cy * vpt[3] + vpt[5]

    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, 0)',
                pointerEvents: 'auto',
                whiteSpace: 'nowrap'
            }}
            className="z-50"
        >
            <Dialog>
                <DialogTrigger className="rounded-full flex items-center gap-2 text-2xl px-5 py-3 bg-black/80 text-white hover:bg-black/70">
                    Type your prompt instead
                    <CircleChevronRight className="w-5 h-5" />
                </DialogTrigger>

                <DialogContent className="bg-[#1e1e1e] border border-white/10 rounded-3xl p-6 w-[420px] text-white">
                    <DialogHeader>
                        <div className="text-3xl tracking-tighter leading-tight">
                            Great! Type your<br />prompt here .
                        </div>
                    </DialogHeader>

                    <div className="mt-4 flex flex-col gap-3">
                        <input
                            placeholder="Your Idea"
                            className="w-1/2 border-1 focus:border-2 rounded-full bg-white/10 px-4 py-2 outline-none placeholder:text-white/60"
                        />

                        <Textarea
                            placeholder="Type here..."
                            className="bg-white/10 border-0 rounded-2xl placeholder:text-white/60"
                        />
                        <div className='flex gap-3 mt-3'>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="flex items-center text-sm gap-2 rounded-full border border-white/20 px-4 py-2 hover:bg-white/10 transition">
                                        <ImagePlus className="w-4 h-4" />
                                        Inspired image
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Add your inspired image for better results
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="flex items-center gap-2 justify-center rounded-full bg-white text-black px-5 py-2 font-medium hover:bg-white/90 transition">
                                        <Sparkles className="w-4 h-4" />
                                        Generate wireframe
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Generate wireframe using this prompt
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
