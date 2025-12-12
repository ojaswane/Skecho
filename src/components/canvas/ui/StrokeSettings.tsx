'use client'
import React from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import ColorPickerEditor from '../colorpicker';

const StrokeSettings = () => {
    const selectedObject = useCanvasStore((s) => s.selectedObject);

    const updateWidth = (e: any) => {
        const canvas = useCanvasStore.getState().canvas;
        const activeObject = canvas?.getActiveObject();
        if (!activeObject) return;

        const newWidth = parseInt(e.target.value, 10) || 0;
        activeObject.set('strokeWidth', newWidth);
        canvas?.renderAll();
        useCanvasStore.getState().setSelectedObject(activeObject);
    };

    const updateStrokeColor = (color: any) => {
        const canvas = useCanvasStore.getState().canvas;
        const activeObject = canvas?.getActiveObject();
        if (!activeObject) return;

        activeObject.set("stroke", color.hex);
        canvas?.renderAll();
        useCanvasStore.getState().setSelectedObject(activeObject);
    };

    const strokePreview =
        typeof selectedObject?.stroke === "string"
            ? selectedObject.stroke
            : "#000000";

    return (
        <section className="w-full">
            <div className="flex w-full items-end gap-8 p-2">

                {/* Stroke Width */}
                <div className="flex flex-col">
                    <label
                        htmlFor="stroke-width"
                        className="uppercase text-[11px] opacity-60 tracking-wide"
                    >
                        Stroke Width
                    </label>

                    <input
                        id="stroke-width"
                        type="number"
                        className="
                            w-20 h-10 mt-1 px-3
                            rounded-md border border-white/20 
                            bg-white/10 text-sm 
                            focus:outline-none focus:ring-1 focus:ring-white/40
                        "
                        value={selectedObject?.strokeWidth || 0}
                        onChange={updateWidth}
                    />
                </div>

                {/* Stroke Color */}
                <div className="flex flex-col">
                    <label className="uppercase text-[11px] opacity-60 tracking-wide">
                        Stroke Color
                    </label>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className="
                                    w-20 h-10 mt-1 rounded-md
                                    border border-white/20 
                                    bg-white/10
                                    flex items-center justify-start p-2
                                    transition
                                    cursor-pointer
                                "
                            >
                                <div
                                    className="w-6 h-6 rounded-full border border-black/20"
                                    style={{ backgroundColor: strokePreview }}
                                />
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            side="right"
                            align="start"
                            className="p-0 shadow-xl rounded-lg"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                            <div className="colorpicker-area">
                                <ColorPickerEditor onChange={updateStrokeColor} />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

            </div>
        </section>
    );
};

export default StrokeSettings;
