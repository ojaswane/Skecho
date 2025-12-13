'use client'
import React from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import ColorPickerEditor from '../colorpicker';

const STROKE_STYLES = [
    { label: "Solid", value: "solid", dash: [] },
    { label: "Dashed", value: "dashed", dash: [8, 4] },
    { label: "Dotted", value: "dotted", dash: [2, 4] },
    { label: "Dash-Dot", value: "dashdot", dash: [10, 4, 2, 4] },
];

const STROKE_ALIGNS = [
    { label: "Inside", value: "inside" },
    { label: "Center", value: "center" },
    { label: "Outside", value: "outside" },
];

type StrokeAlign = 'inside' | 'center' | 'outside';
const StrokeSettings = () => {
    const selectedObject = useCanvasStore((s) => s.selectedObject);

    const updateWidth = (e: any) => {
        const canvas = useCanvasStore.getState().canvas;
        const obj = canvas?.getActiveObject();
        if (!obj) return;

        const width = parseInt(e.target.value, 10) || 0;
        obj.set("strokeWidth", width);
        canvas?.renderAll();
        useCanvasStore.getState().setSelectedObject(obj);
    };

    const updateStrokeColor = (color: any) => {
        const canvas = useCanvasStore.getState().canvas;
        const obj = canvas?.getActiveObject();
        if (!obj) return;

        obj.set("stroke", color.hex);
        canvas?.renderAll();
        useCanvasStore.getState().setSelectedObject(obj);
    };

    const updateStrokeStyle = (e: any) => {
        const canvas = useCanvasStore.getState().canvas;
        const obj = canvas?.getActiveObject();
        if (!obj) return;

        const selected = STROKE_STYLES.find(s => s.value === e.target.value);
        obj.set("strokeDashArray", selected?.dash || []);

        canvas?.renderAll();
        useCanvasStore.getState().setSelectedObject(obj);
    };

    const strokePreview =
        typeof selectedObject?.stroke === "string"
            ? selectedObject.stroke
            : "#000000";

    const currentStyle = STROKE_STYLES.find(
        s =>
            JSON.stringify(s.dash) ===
            JSON.stringify(selectedObject?.strokeDashArray || [])
    )?.value || "solid";

    const SetStrokeAlign = (align: StrokeAlign) => {
        const obj = useCanvasStore.getState().canvas?.getActiveObject();
        if (!obj) return;

        const stroke = obj.get("strokeWidth") || 0;

        if (align === 'inside') {
            // we will just shrink the object little bit by the stoke width
            const Shrink =  (obj.width! - stroke) / obj.width!;
            obj.scaleX = (obj.scaleX || 1) * Shrink;
            obj.scaleY = (obj.scaleY || 1) * Shrink;
        } else if(align === "outside") {
            // we will just increase the object little bit by the stoke width
            const Grow = (obj.width! + stroke) / obj.width!;
            obj.scaleX = (obj.scaleX || 1) * Grow;
            obj.scaleY = (obj.scaleY || 1) * Grow;
        }
    }


    return (
        <section className="w-full">

            {/* WIDTH + COLOR */}
            <div className="flex w-full items-end gap-6 p-2">

                {/* Width */}
                <div className="flex flex-col">
                    <label className="uppercase text-[11px] opacity-60 tracking-wide">
                        Stroke Width
                    </label>

                    <input
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

                {/* Color */}
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

            {/* STROKE STYLE */}
            <div className=" mt-3 flex flex-col w-full">
                <label className="uppercase text-[11px] opacity-60 tracking-wide">
                    Stroke Style
                </label>

                <select
                    value={currentStyle}
                    onChange={updateStrokeStyle}
                    className="
                        mt-1 w-40 h-10
                        bg-white/10 border border-white/20
                        rounded-md px-3 text-sm
                        focus:outline-none focus:ring-1 focus:ring-white/40
                    "
                >
                    {STROKE_STYLES.map((item) => (
                        <option key={item.value} value={item.value} className='dark:bg-black dark:text-white mt-2'>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>

        </section>
    );
};

export default StrokeSettings;