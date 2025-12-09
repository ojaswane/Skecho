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
import { Circle as FabricCircle, Rect as FabricRect, Line as FabricLine , IText as text} from "fabric"
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

    const canvas = canvasEditor;
    const handleToolClick = (toolName: Tool) => {
        console.log("Tool clicked:", toolName);
        console.log("Canvas available:", !!canvas);

        setActiveTool(toolName);

        if (toolName === "Circle") {
            console.log("Creating circle...");
            if (!canvas) {
                console.error("Canvas is not available");
                return;
            }

            try {
                const properties = {
                    left: canvas.width! / 2 - 50,
                    top: canvas.height! / 2 - 50,
                    radius: 50,
                    fill: "#3b82f6",
                    stroke: "#1e40af",
                    strokeWidth: 4,
                }

                const circleRef = new FabricCircle({
                    ...properties
                });

                console.log("Circle created successfully:", circleRef);
                console.log("Canvas type:", typeof canvas);
                console.log("Add method exists:", typeof canvas.add === 'function');

                canvas.add(circleRef as any);
                canvas.renderAll();

                console.log("Circle added and rendered");
            } catch (error) {
                console.error("Error creating circle:", error);
            }
        } else if (toolName === "Rectangle") {
            console.log("Creating rectangle...");
            if (!canvas) {
                console.error("Canvas is not available");
                return;
            }

            try {
                const properties = {
                    left: canvas.width! / 2 - 50,
                    top: canvas.height! / 2 - 50,
                    width: 100,
                    height: 100,
                    fill: "#3b82f6",
                    stroke: "#1e40af",
                    strokeWidth: 4,
                }

                const rectangleRef = new FabricRect({
                    ...properties
                });

                console.log("Rectangle created successfully:", rectangleRef);
                console.log("Canvas type:", typeof canvas);
                console.log("Add method exists:", typeof canvas.add === 'function');

                canvas.add(rectangleRef as any);
                canvas.renderAll();

                console.log("Rectangle added and rendered");
            } catch (error) {
                console.error("Error creating rectangle:", error);
            }
        } else if (toolName === "Arrow") {
            console.log("Creating arrow...");
            if (!canvas) {
                console.error("Canvas is not available");
                return;
            }

            try {
                const startX = canvas.width! / 2 - 50;
                const startY = canvas.height! / 2 - 50;
                const endX = canvas.width! / 2 + 50;
                const endY = canvas.height! / 2 + 50;

                const arrowRef = new FabricLine(
                    [startX, startY, endX, endY],
                    {
                        stroke: "#1e40af",
                        strokeWidth: 4,
                        fill: "#1e40af",
                    }
                );

                console.log("Arrow created successfully:", arrowRef);
                console.log("Canvas type:", typeof canvas);
                console.log("Add method exists:", typeof canvas.add === 'function');

                canvas.add(arrowRef as any);
                canvas.renderAll();

                console.log("Arrow added and rendered");
            } catch (error) {
                console.error("Error creating arrow:", error);
            }
        } else if (toolName === "Text") {
            console.log("Text tool selected");
            if(!canvas) {
                console.error("Canvas is not available");
                return;
            }
            try {
                const properties = {
                    left: canvas.width! / 2 - 50,
                    top: canvas.height! / 2 - 50,
                    fontSize: 24,
                    fill: "#ffffff",
                    fontFamily: "Arial",
                    fontWeight: "normal" as "normal" | "bold" | "bolder" | "lighter" | number,
                    editable: true,
                }
                const textRef = new text('text', ({
                    ...properties
                }))
                canvas.add(textRef as any);
                canvas.renderAll();
                console.log("Text added and rendered");
            } catch (e) {
                console.error("Error creating text:", e);
            }
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
        </div>
    )
}

export default Tools