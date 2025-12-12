'use client'
import React from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
const StrokeSettings = () => {
    const selectedObject = useCanvasStore((s) => s.selectedObject)

    const updateWidth = (e: any) => {
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
            <section title='Stroke' className=' '>
                {/* Stroke Width */}
                <div className='flex w-full  justify-between items-center gap-4 text-[15px]'>
                    <div>
                        <label htmlFor='stroke-width' className=' uppercase text-[12px] opacity-60'>Stroke Width</label>
                        <input
                            id='stroke-width'
                            type='number'
                            className="w-16 h-8 rounded border border-white/20 bg-white/10 px-2 mt-1"
                            value={selectedObject?.strokeWidth || 0}
                            onChange={updateWidth}
                        />
                    </div>

                    {/* Stroke color */}
                    <div className=''>
                        <label htmlFor='stroke-color' className="text-[12px] uppercase opacity-60">Stroke Color</label>
                        <div className='w-16 h-8 border flex items-center rounded border-white/20 bg-white/10'>
                            <input
                                id='stroke-color'
                                type='color'
                                className="w-8  rounded-full  px-2 mt-1"
                                value={selectedObject?.stroke || '#000000'}
                                onChange={(e) => {
                                    const canvas = useCanvasStore.getState().canvas;
                                    const activeObject = canvas?.getActiveObject();
                                    if (!activeObject) return;
                                    activeObject.set('stroke', e.target.value);
                                    canvas?.renderAll();
                                    useCanvasStore.getState().setSelectedObject(activeObject);
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* stroke opacity */}


            </section>
        </>
    )
}

export default StrokeSettings