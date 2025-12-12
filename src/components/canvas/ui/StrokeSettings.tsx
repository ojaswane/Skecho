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

    // stroke color update
    const updateStrokeColor = (color: any) => {
        const canvas = useCanvasStore.getState().canvas;
        const activeObject = canvas?.getActiveObject();
        if (!activeObject) return;

        activeObject.set("stroke", color.hex);
        activeObject.set("dirty", true);
        canvas?.renderAll();

        useCanvasStore.getState().setSelectedObject(activeObject);
    };

    // FIXED preview — using STROKE not FILL
    const strokePreview =
        typeof selectedObject?.stroke === "string"
            ? selectedObject.stroke
            : "#000000";

    return (
        <section className="w-full">
            {/* Stroke Width + Color */}
            <div className="flex w-full justify-between items-center gap-4 text-[15px]">

                {/* WIDTH */}
                <div>
                    <label
                        htmlFor="stroke-width"
                        className="uppercase text-[12px] opacity-60"
                    >
                        Stroke Width
                    </label>

                    <input
                        id="stroke-width"
                        type="number"
                        className="w-16 h-8 rounded border border-white/20 bg-white/10 px-2 mt-1"
                        value={selectedObject?.strokeWidth || 0}
                        onChange={updateWidth}
                    />
                </div>

                {/* COLOR PICKER */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className="
                                w-10 h-10 mt-4 rounded-full 
                                border border-white/20 
                                bg-white/20 dark:bg-white/10 
                                cursor-pointer flex items-center justify-center
                            "
                        >
                            <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: strokePreview }}
                            />
                        </button>
                    </PopoverTrigger>

                    <PopoverContent
                        side="right"
                        align="start"
                        className="p-0"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onInteractOutside={(e) => {
                            if (
                                e.target instanceof HTMLElement &&
                                e.target.closest(".colorpicker-area")
                            ) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <div className="colorpicker-area">
                            <ColorPickerEditor onChange={updateStrokeColor} />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </section>
    );
};

export default StrokeSettings;
