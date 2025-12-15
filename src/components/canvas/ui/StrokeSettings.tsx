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
    { label: "Center", value: "center" },
    { label: "Inside", value: "inside" },
    { label: "Outside", value: "outside" },
];

type StrokeAlign = 'inside' | 'center' | 'outside';
const StrokeSettings = () => {
    const selectedObject = useCanvasStore((s) => s.selectedObject);

    // stroke width handling
    const updateWidth = (e: any) => {
        const canvas = useCanvasStore.getState().canvas;
        const obj = canvas?.getActiveObject();
        if (!obj) return;

        const width = parseInt(e.target.value, 10) || 0;
        obj.set("strokeWidth", width);
        canvas?.renderAll();
        useCanvasStore.getState().setSelectedObject(obj);
    };


    // Stroke color handeling
    const updateStrokeColor = (color: any) => {
        const canvas = useCanvasStore.getState().canvas;
        const obj = canvas?.getActiveObject();
        if (!obj) return;

        obj.set("stroke", color.hex);
        canvas?.renderAll();
        useCanvasStore.getState().setSelectedObject(obj);
    };



    // Stroke Style Handling
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



    // Stoke Align Handling
    const setStrokeAlign = (align: StrokeAlign) => {
        const canvas = useCanvasStore.getState().canvas;
        const obj = canvas?.getActiveObject();
        if (!obj) return;

        const baseWidth = obj.get("strokeWidth") || 0;

        obj.set({
            strokeUniform: true,
        });

        switch (align) {
            case "inside":
                obj.set({
                    strokeWidth: baseWidth,
                    paintFirst: "stroke", // keeps stroke inside
                });
                break;

            case "outside":
                obj.set({
                    strokeWidth: baseWidth * 2, // fake outside stroke
                    paintFirst: "stroke",
                });
                break;

            case "center":
            default:
                obj.set({
                    strokeWidth: baseWidth,
                    paintFirst: "fill",
                });
                break;
        }

        obj.setCoords();
        canvas?.requestRenderAll();
        useCanvasStore.getState().setSelectedObject(obj);
    };


    const updateStrokeAlign = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStrokeAlign(e.target.value as StrokeAlign);
    };



    return (
        <section className="w-full">

            {/* WIDTH + COLOR */}
            <div className="flex w-full items-end gap-2 mb-3 ">

                {/* Width */}
                <div className="flex flex-col">
                    <label className="uppercase text-[11px] opacity-60 tracking-wide">
                        Stroke Width
                    </label>

                    <input
                        type="number"
                        className="
                            w-20 h-8 mt-1 px-3
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
                                    w-20 h-8 mt-1 rounded-md
                                    border border-white/20
                                    bg-white/10
                                    flex items-center justify-start p-2
                                    cursor-pointer
                                "
                            >
                                <div
                                    className="w-6 h-6 rounded-full border border-white/20"
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
            <div className=" mt-5 flex flex-col w-full">
                <label className="uppercase text-[11px] opacity-60 tracking-wide">
                    Stroke Style
                </label>

                <select
                    value={currentStyle}
                    onChange={updateStrokeStyle}
                    className="
                    mt-1 w-43 h-10
                        bg-white/10 border border-white/20
                        rounded-md px-2
                        focus:outline-none focus:ring-1 focus:ring-white/40
                        p-2
                        cursor-pointer
                        "
                >
                    {STROKE_STYLES.map((item) => (
                        <option key={item.value} value={item.value} className='dark:bg-black dark:text-white mt-2'>
                            {item.label}
                        </option>
                    ))}
                </select>

            </div>
            {/* STROKE ALIGN */}
            <div className=" mt-5 flex flex-col w-full">
                <label className='uppercase text-[11px] opacity-60 tracking-wide'>stroke align</label>
                <select
                    onChange={updateStrokeAlign as any}
                    className="
                    mt-1 w-43 h-10
                        bg-white/10 border border-white/20
                        rounded-md px-2
                        focus:outline-none focus:ring-1 focus:ring-white/40
                        p-2
                        cursor-pointer
                        "
                    defaultValue={"center"}
                >
                    {STROKE_ALIGNS.map((item) => (
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