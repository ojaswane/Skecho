'use client'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import * as fabric from 'fabric'
import React, { useEffect, useState } from 'react'
import { Frame } from '../../../../lib/store/canvasStore'

const DEFAULT_TEXT = {
    text: "Sketch Your Design's Here",
    fontFamily: "inter",
    fontSize: 32,
    letterSpacing: -4,
    fill : "#000"
}
export default function DefaultText({ textObj }: { textObj: fabric.Text }) {

    const canvas = useCanvasStore(s => s.canvas)
    const [, forceUpdate] = useState(0)
    const frames = useCanvasStore((s) => s.frames)

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

    if (!canvas) return null

    const vpt = canvas.viewportTransform!
    const zoom = canvas.getZoom()

    const x = textObj.left! * vpt[0] + vpt[4]
    const y = textObj.top! * vpt[3] + vpt[5]

    //setting the default text

    const frame = frames[0] // default frame
    const centerX = frame.left + frame.width / 2
    const centerY = frame.top + frame.height / 2

    useEffect(() => {
        if (!canvas || !frame) return

        const placeholder = new fabric.Text(DEFAULT_TEXT.text, {
            left: frame.left + frame.width / 2,
            top: frame.top + frame.height / 2,
            originX: "center",
            originY: "center",
            fontSize: DEFAULT_TEXT.fontSize,
            fontFamily: DEFAULT_TEXT.fontFamily,
            fill: DEFAULT_TEXT.fill,
            selectable: false,
            evented: false,
            opacity: 0.6,
        })

        placeholder.set("frameId", frame.id)
        placeholder.set("isPlaceholder", true)

        canvas.add(placeholder)
        canvas.renderAll()

        useCanvasStore.getState().setDefaultTextObject(placeholder)

    }, [canvas])


    useEffect(() => {
        canvas.on("text:changed", (e) => {
            const obj = e.target
            if (obj?.get("isPlaceholder")) {
                obj.set("opacity", 1)
                obj.set("isPlaceholder", false)
            }
        })
        canvas.getObjects().forEach(obj => {
            if (obj.get("isPlaceholder")) {
                canvas.remove(obj)
            }
        })

    }, [canvas])

    return (

        //For Buttons (This is a Html component)
        <button
            style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${zoom})`,
                transformOrigin: 'center',
            }}
            className="px-3 py-1 rounded-full text-sm bg-black/10 hover:bg-black/20 cursor-pointer pointer-events-auto"
        >
            Type your prompt instead
        </button>
    )
}