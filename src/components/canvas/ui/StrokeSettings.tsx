'use client'
import React from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
const StrokeSettings = () => {
    const selectedObject = useCanvasStore((s) => s.selectedObject)

    const updateWidth = (e :any) => {
        const canvas = useCanvasStore.getState().canvas;
        const activeObject = canvas?.getActiveObject();
        if (!activeObject) return;

        const newWidth = parseInt(e.target.value, 10) || 0;
        activeObject.set('strokeWidth', newWidth);
        canvas?.renderAll();
        useCanvasStore.getState().setSelectedObject(activeObject);
    }

    return (
        <>
            <section title='Stroke'>
                {/* Stroke Width */}
                <div>
                    <label htmlFor='stroke-width' className='className="text-[10px] uppercase opacity-60"'>Stroke Width</label>
                    <input
                        id='stroke-width'
                        type='number'
                        className="w-full h-8 rounded border border-white/20 bg-white/10 px-2 mt-1"
                        value={selectedObject?.strokeWidth || 0}
                        onChange={updateWidth}
                    />
                </div>
            </section>
        </>
    )
}

export default StrokeSettings