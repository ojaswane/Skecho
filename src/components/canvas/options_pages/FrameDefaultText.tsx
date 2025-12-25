'use client'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import { Text } from 'fabric'
import React, { useEffect, useState } from 'react'
import { CircleChevronRight } from 'lucide-react';

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
        <button
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
            Type your prompt instead
            <CircleChevronRight className='w-10'/>
        </button>
    )
}