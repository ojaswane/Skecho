'use client'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import { Text } from 'fabric'
import React, { useEffect, useState } from 'react'
import { CircleChevronRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus } from 'lucide-react';

const DEFAULT_TEXT = {
    text: "Sketch Your Idea Here!",
    fontSize: 65,
    letterSpacing: -20,
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

    // Add default text only when frame exists
    useEffect(() => {
        if (!canvas || frames.length === 0) return

        const frame = frames[0]

        // Remove previous placeholder to avoid duplicates
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

        placeholder.set("frameId", frame.id)
        placeholder.set("isPlaceholder", true)

        canvas.add(placeholder)
        canvas.renderAll()

        useCanvasStore.getState().setDefaultTextObject(placeholder)

    }, [canvas, frames])

    // When user types
    useEffect(() => {
        if (!canvas) return
        const handler = (e: any) => {
            const obj = e.target
            if (obj?.get("isPlaceholder")) {
                obj.set({ opacity: 1 })
                obj.set("isPlaceholder", false)
                canvas.renderAll()
            }
        }
        canvas.on("text:changed", handler)
        return () => canvas.off("text:changed", handler)
    }, [canvas])

    if (!canvas || frames.length === 0) return null

    const frame = frames[0]
    const zoom = canvas.getZoom()
    const vpt = canvas.viewportTransform!

    const centerY = frame.top + frame.height / 2 // this is the margin for the y pos

    const x = (frame.left + frame.width / 2) * vpt[0] + vpt[4]
    const y = (frame.top + centerY) * vpt[3] + vpt[5]

    return (
        <div
            onClick={() => console.log("Ai prompt button")}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, 0) scale(${zoom})`,
                transformOrigin: 'top center',
                pointerEvents: 'auto',
                whiteSpace: 'nowrap'
            }}
            className=" rounded-full flex items-center justify-center gap-2 text-4xl p-4 bg-black/80 -mt-2 fixed tracking-tighter hover:bg-black/70 cursor-pointer"
        >
            <Dialog>
                <DialogTrigger className="w-full flex justify-center items-center gap-2 cursor-pointer h-full text-4xl bg-transparent border-0 outline-0 focus:ring-0 p-0">
                    Type your prompt instead
                    <CircleChevronRight className='text-2xl' />
                </DialogTrigger>

                <DialogContent className="bg-[#1e1e1e] border border-white/10 rounded-3xl p-6 w-[420px] text-white">
                    <DialogHeader className="space-y-4">
                        <div className="text-3xl tracking-tighter ">
                            Great! Type your<br />prompt here .
                        </div>
                    </DialogHeader>

                    <div className="mt-4 flex flex-col gap-2 text-lg tracking-tight" >

                        {/* Small input */}
                        <input
                            placeholder="Your Idea"
                            className="mt-4 w-full rounded-full bg-white/10 px-4 py-2  outline-none placeholder:text-white/60"
                        />

                        {/* Textarea */}
                        <Textarea
                            placeholder="Type here..."
                        />

                        {/* Buttons */}
                        <div className="mt-6 flex items-center justify-between gap-2">
                            <button className="flex justify-center items-center gap-2 rounded-full border border-white/20 px-4 py-2  hover:bg-white/10 transition">
                                <ImagePlus/>
                                Inspired image
                            </button>

                            <button className="rounded-full bg-white text-black px-5 py-2   font-medium hover:bg-white/90 transition">
                                Generate wireframe
                            </button>
                        </div>
                    </div>
                </DialogContent>

            </Dialog>
        </div >
    )
}