import React, { useEffect, useState } from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'

const Layers = () => {
    const [layers, setLayers] = useState<any[]>([])
    const canvas = useCanvasStore((s) => s.canvas)
    useEffect(() => {
        if (!canvas) return

        const updateLayers = () => {
            const objs = canvas.getObjects().map((obj, i) => ({
                id: (obj as any).id || `layer-${i}`,
                name: (obj as any).name || obj.type || "Unnamed Layer",
                object: obj
            })).reverse()

            setLayers(objs)
        }

        //calling the function updatedLayers
        updateLayers()

        canvas.on("object:added", updateLayers)
        canvas.on("object:removed", updateLayers)

        return () => {
            canvas.off("object:added", updateLayers)
            canvas.off("object:removed", updateLayers)
        }
    }, [canvas])

    return (
        <div
            className='w-64 h-full mt-10 rounded-xl
            border border-white/20
            bg-white/10 dark:bg-white/5
            backdrop-blur-2xl
            shadow-[0_8px_32px_rgba(0,0,0,0.15)]
            flex flex-col ml-3'
        >
            <h3 className="text-md font-semibold p-2">Layers</h3>

            {layers.map(layer => (
                <div
                    key={layer.id}
                    onClick={() => {
                        canvas?.setActiveObject(layer.object)
                        canvas?.renderAll()
                    }}
                    className="p-2 text-sm hover:bg-black/10 rounded cursor-pointer"
                >
                    {layer.name}
                </div>
            ))}
        </div>
    )
}

export default Layers