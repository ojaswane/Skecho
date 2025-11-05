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

const Tools = () => {
    const tools = [
        { name: "Select", icon: MousePointer2 },
        { name: "Rectangle", icon: Square },
        { name: "Circle", icon: Circle },
        { name: "Text", icon: Type },
        { name: "Image", icon: ImageIcon },
        { name: "Arrow", icon: ArrowRight },
        { name: "Frame", icon: Frame },
    ]

    return (
        <div className="col-span-1 flex justify-center items-center">
            <div
                className="inline-flex items-center rounded-full backdrop-blur-xl
        bg-white/10 border border-white/10 text-neutral-300 p-1 saturate-150 shadow-lg"
                aria-hidden
            >
                {tools.map((tool, index) => {
                    const Icon = tool.icon
                    return (
                        <span
                            key={index}
                            title={tool.name}
                            className="inline-grid h-9 w-9 place-items-center rounded-full 
              hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                            <Icon size={16} className="opacity-80 stroke-[1.75]" />
                        </span>
                    )
                })}
            </div>
        </div>
    )
}

export default Tools
