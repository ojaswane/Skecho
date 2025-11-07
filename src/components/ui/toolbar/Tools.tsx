"use client"
import React from "react"
import {
    MousePointer2,
    Square,
    Circle,
    Type,
    Image as ImageIcon,
    ArrowRight,
    Frame,
} from "lucide-react"
import { ThemeToggleButton } from "@/components/ui/skiper-ui/Skiper26(bottom-up)"
import { useCanvasStore } from "../../../../lib/store/canvasStore"

const Tools = () => {
    const { activeTool, setActiveTool } = useCanvasStore()

    const tools = [
        { name: "Select", icon: MousePointer2 },
        { name: "Frame", icon: Frame },
        { name: "Rectangle", icon: Square },
        { name: "Circle", icon: Circle },
        { name: "Text", icon: Type },
        { name: "Image", icon: ImageIcon },
        { name: "Arrow", icon: ArrowRight },
    ]

    return (
        <div className="col-span-1 flex justify-center items-center">
            <div
                className="inline-flex items-center rounded-full backdrop-blur-xl
        bg-white/10 border border-white/10 text-neutral-300 p-1 saturate-150 shadow-lg"
                aria-hidden
            >
                {tools.map((tool) => {
                    const Icon = tool.icon
                    const isActive = activeTool === tool.name

                    return (
                        <button
                            key={tool.name}
                            title={tool.name}
                            onClick={() => setActiveTool(tool.name)}
                            className={`inline-grid h-9 w-9 place-items-center rounded-full transition-all cursor-pointer
                ${isActive ? "bg-white/20 text-white" : "hover:bg-white/10 hover:text-white"}
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
        </div>
    )
}

export default Tools
