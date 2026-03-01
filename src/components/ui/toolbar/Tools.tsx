"use client"
import React, { useEffect } from "react"
import {
    MousePointer2,
    Square,
    Circle,
    Type,
    Image as ImageIcon,
    ArrowRight,
    Frame,
    Brush
} from "lucide-react"
import {
    Circle as FabricCircle,
    Rect as FabricRect,
    Line as FabricLine,
    IText as text,
} from "fabric"
import * as fabric from "fabric"
import { useCanvasStore } from "../../../../lib/store/canvasStore"
type Tool = "Select" | "Frame" | "Rectangle" | "Circle" | "Text" | "Image" | "Arrow" | 'Sketch'
import { Plus } from 'lucide-react';

const Tools = () => {
    const { activeTool, setActiveTool } = useCanvasStore()
    const canvas = useCanvasStore((state) => state.canvas)

    const tools = [
        { name: "Select" as Tool, icon: MousePointer2 },
        { name: "Frame" as Tool, icon: Frame },
        { name: "Brush" as Tool, icon: Brush },
        { name: "Arrow" as Tool, icon: ArrowRight },
        { name: "Rectangle" as Tool, icon: Square },
        { name: "Circle" as Tool, icon: Circle },
        { name: "Text" as Tool, icon: Type },
        { name: "Image" as Tool, icon: ImageIcon },
    ]

    const handleToolClick = (toolName: Tool) => {
        setActiveTool(toolName)
        if (!canvas) return

        // reset drawing mode for all tools
        canvas.isDrawingMode = false

        if (toolName === "Sketch") {
            canvas.isDrawingMode = true

            const brush = new fabric.PencilBrush(canvas)
            brush.color = "#000000"
            brush.width = 3

            canvas.freeDrawingBrush = brush
            return
        }

        if (toolName === "Circle") {
            const circleRef = new FabricCircle({
                left: canvas.width! / 2 - 50,
                top: canvas.height! / 2 - 50,
                radius: 50,
                fill: "#3b82f6",
                stroke: "#1e40af",
                strokeWidth: 4,
            })

            canvas.add(circleRef as unknown as fabric.Object)
            canvas.renderAll()
        }

        if (toolName === "Rectangle") {
            const rectangleRef = new FabricRect({
                left: canvas.width! / 2 - 50,
                top: canvas.height! / 2 - 50,
                width: 100,
                height: 100,
                fill: "#3b82f6",
                stroke: "#1e40af",
                strokeWidth: 4,
            })

            canvas.add(rectangleRef as unknown as fabric.Object)
            canvas.renderAll()
        }

        if (toolName === "Arrow") {
            const arrowRef = new FabricLine(
                [
                    canvas.width! / 2 - 50,
                    canvas.height! / 2 - 50,
                    canvas.width! / 2 + 50,
                    canvas.height! / 2 + 50,
                ],
                {
                    stroke: "#1e40af",
                    strokeWidth: 4,
                }
            )

            canvas.add(arrowRef as unknown as fabric.Object)
            canvas.renderAll()
        }

        if (toolName === "Text") {
            const textRef = new text("text", {
                left: canvas.width! / 2 - 50,
                top: canvas.height! / 2 - 50,
                fontSize: 24,
                fill: "#ffffff",
                editable: true,
            })

            canvas.add(textRef as unknown as fabric.Object)
            canvas.renderAll()
        }

        if (toolName === "Image") {
            document.getElementById("fileInput")?.click()
        }
    }



    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canvas) return
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = async () => {
            const img = await fabric.Image.fromURL(
                reader.result as string,
                { crossOrigin: "anonymous" }
            )

            img.set({
                left: canvas.width! / 2 - img.width! / 2,
                top: canvas.height! / 2 - img.height! / 2,
                scaleX: 0.5,
                scaleY: 0.5,
                selectable: true,
            })

            canvas.add(img as unknown as fabric.Object)
            canvas.setActiveObject(img as unknown as fabric.Object)
            canvas.renderAll()
        }

        reader.readAsDataURL(file)
        e.target.value = ""
    }


    return (
        <>
            <input
                id="fileInput"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
            />

            <div className="col-span-1 flex flex-col gap-4 justify-center items-center">

                {/* Describe section */}
                <div className="flex items-center gap-2 p-1.5 px-3 w-full max-w-xl
                backdrop-blur-xl saturate-150 shadow-sm rounded-full
                dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10">

                    <button className="flex-shrink-0 cursor-pointer w-6 h-6 rounded-full border-dashed border border-neutral-500/50 flex justify-center items-center hover:bg-white/10 transition-colors">
                        <Plus className="w-4 h-4 text-neutral-500" />
                    </button>

                    <input
                        className="flex-1 bg-transparent border-none outline-none text-sm py-1 dark:text-neutral-300 text-neutral-800 placeholder:text-neutral-500"
                        placeholder="Describe what you are building..."
                        title={"inspired image"}
                        name="inspired image"
                    />
                </div>


                <div className="inline-flex items-center rounded-full backdrop-blur-xl
                    dark:bg-white/10 border dark:border-white/10 dark:text-neutral-300
                    bg-black/30 border-black/20 text-black p-1 saturate-150 shadow-lg"
                >
                    {tools.map((tool) => {
                        const Icon = tool.icon
                        const isActive = activeTool === tool.name

                        return (
                            <button
                                key={tool.name}
                                title={tool.name}
                                onClick={() => handleToolClick(tool.name)}
                                className={`inline-grid h-7 w-7 place-items-center rounded-full transition-all
                                ${isActive
                                        ? "bg-black/20 dark:bg-white/20"
                                        : "hover:bg-black/10 dark:hover:bg-white/10"
                                    }`}
                            >
                                <Icon size={16} className="opacity-80 stroke-[1.75]" />
                            </button>
                        )
                    })}

                    {/* <span className="mx-2 flex justify-center items-center">
                        <ThemeToggleButton
                            variant="circle-blur"
                            start="bottom-up"
                            blur
                            className="w-7 h-7"
                        />
                    </span> */}
                </div>
            </div>
        </>
    )
}

export default Tools