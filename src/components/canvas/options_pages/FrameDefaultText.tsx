'use client'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import * as fabric from 'fabric'
import React, { useEffect, useState } from 'react'

const DEFAULT_TEXT = {
    text: "Sketch Your Design's Here",
    font: "inter",
    fontWidth : 32,
    letterSpacing : -9
}
export default function PromptButtonOverlay({ textObj }: { textObj: fabric.Text }) {

    const canvas = useCanvasStore(s => s.canvas)
    const [, forceUpdate] = useState(0)

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

    return (

        //adding the canvas component


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
