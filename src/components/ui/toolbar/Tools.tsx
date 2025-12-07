"use client"
import React from "react"
import {
    MousePointer2,
    Square,
    Circle,
    Type,
    Image as ImageIcon,
    ArrowRight,
    Frame
} from "lucide-react"
import { Circle as FabricCircle } from "fabric"
import { ThemeToggleButton } from "@/components/ui/skiper-ui/Skiper26(bottom-up)"
import { useCanvasStore } from "../../../../lib/store/canvasStore"
type Tool = "Select" | "Frame" | "Rectangle" | "Circle" | "Text" | "Image" | "Arrow"

const Tools = () => {
    const { activeTool, setActiveTool } = useCanvasStore()

    const tools = [
        { name: "Select" as Tool, icon: MousePointer2 },
        { name: "Frame" as Tool, icon: Frame },
        { name: "Rectangle" as Tool, icon: Square },
        { name: "Circle" as Tool, icon: Circle },
        { name: "Text" as Tool, icon: Type },
        { name: "Image" as Tool, icon: ImageIcon },
        { name: "Arrow" as Tool, icon: ArrowRight },
    ]

    const canvasEditor = useCanvasStore((state) => state.canvas);

    const handleToolClick = (toolName: Tool) => {
        setActiveTool(toolName);

        if (toolName === "Circle") {
            const properties = {
                left: 100,
                top: 100,
                fill: '#3b82f6',
                radius: 30,
                stroke: '#1e40af',
                strokeWidth: 2,
            }

            const circleRef = new FabricCircle({
                ...properties
            });
            console.log("Circle Tool Selected: ", circleRef);
            canvasEditor?.add(circleRef as any);
            canvasEditor?.renderAll();
        }
    }
    return (
        <div className="col-span-1 flex justify-center items-center">
            <div
                className="inline-flex items-center rounded-full backdrop-blur-xl
        dark:bg-white/10 border dark:border-white/10 dark:text-neutral-300 bg-black/30  border-black/20 text-black p-1 saturate-150 shadow-lg"
                aria-hidden
            >
                {tools.map((tool) => {
                    const Icon = tool.icon
                    const isActive = activeTool === tool.name

                    return (
                        <button
                            key={tool.name}
                            title={tool.name}
                            onClick={() => {
                                handleToolClick(tool.name)
                            }}
                            className={`inline-grid h-9 w-9 place-items-center rounded-full transition-all cursor-pointer
                ${isActive ? " bg-black/20  dark:bg-white/20 dark:text-white text-black" : "dark:hover:bg-white/10 hover:bg-black/10 dark:hover:text-white hover:text-black/10"}
            `}
                        >
                            <Icon size={16} className="opacity-80 stroke-[1.75]" />
                        </button>
                    )
                })}

                {/* theme toggler at end */}
                <span className="mx-2 flex justify-center items-center">
                    <ThemeToggleButton
                        variant="circle-blur"
                        start="bottom-up"
                        blur
                        className="w-7 h-7"
                    />
                </span>
            </div>
        </div >
    )
}

export default Tools
