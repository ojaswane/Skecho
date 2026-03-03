'use client'
import { useCanvasStore } from '../../../../../lib/store/canvasStore';
import { Text, Group } from 'fabric'
import React, { useEffect, useState } from 'react'

// 1. Extend Fabric's interface to recognize your custom properties
declare module 'fabric' {
    interface TObject {
        isPlaceholder?: boolean;
        frameId?: string | number;
    }
    interface ITObjectOptions {
        isPlaceholder?: boolean;
        frameId?: string | number;
    }
}

export default function DefaultText() {
    const canvas = useCanvasStore((s: any) => s.canvas)
    const frames = useCanvasStore((s: any) => s.frames)
    const [, forceUpdate] = useState(0)
    const [hasUserStarted, setHasUserStarted] = useState(false)

    // Sync overlay with zoom / pan (Keep your existing logic)
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

    // Helper: count real user objects
    const getUserObjectCount = () => {
        if (!canvas) return 0
        return canvas.getObjects().filter((obj: any) =>
            !obj.get?.("isPlaceholder") && !obj.get?.("isFrame")
        ).length
    }

    // Effect to add the Placeholder Group
    useEffect(() => {
        if (!canvas || frames.length === 0 || hasUserStarted) return

        const frame = frames[0]

        // Clean up existing placeholders
        canvas.getObjects().forEach((obj: any) => {
            if (obj.get?.("isPlaceholder")) canvas.remove(obj)
        })

        // Create Heading
        const heading = new Text("Ai Zone", {
            fontSize: 42,
            fontWeight: 'bold',
            fontFamily: 'Arial',
            fill: "#000",
            charSpacing: -50, // tracking-tighter
            originX: "center",
            top: 0
        })

        // Create Subheading
        const subheading = new Text("SKETCH TO GET RESULTS", {
            fontSize: 14,
            fontFamily: 'Arial',
            fill: "rgba(0,0,0,0.5)",
            charSpacing: 150, // wide tracking
            originX: "center",
            top: 50
        })

        // Create Group
        const placeholderGroup = new Group([heading, subheading], {
            left: frame.left + frame.width / 2,
            top: frame.top + frame.height / 2,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
        }) as any

        // Set custom properties
        placeholderGroup.set("isPlaceholder", true)
        placeholderGroup.set("frameId", frame.id)

        canvas.add(placeholderGroup)
        canvas.bringObjectToFront(placeholderGroup)
        canvas.renderAll()

        useCanvasStore.getState().setDefaultTextObject(placeholderGroup)
    }, [canvas, frames, hasUserStarted])

    return null // Logic is purely inside the Fabric Canvas
}