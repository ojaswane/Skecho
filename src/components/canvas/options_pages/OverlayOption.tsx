'use client'
import React, { useEffect } from 'react'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import * as fabric from 'fabric'
import { Sparkles, ImagePlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
const FramesOverlay = ({ frame }: any) => {
    const canvas = useCanvasStore((s) => s.canvas)
    if (!canvas) return null

    function canvasToScreen(canvas: fabric.Canvas, x: number, y: number) {
        const vpt = canvas.viewportTransform!
        return {
            x: x * vpt[0] + vpt[4],
            y: y * vpt[3] + vpt[5],
        }
    }

    const [, forceUpdate] = React.useState(0)

    useEffect(() => {
        const update = () => forceUpdate(n => n + 1)
        canvas.on("mouse:wheel", update)
        canvas.on("object:moving", update)
        canvas.on("after:render", update)

        return () => {
            canvas.off("mouse:wheel", update)
            canvas.off("object:moving", update)
            canvas.off("after:render", update)
        }
    }, [canvas])

    const zoom = canvas.getZoom()
    const pos = canvasToScreen(canvas, frame.left, frame.top)

    const BAR_HEIGHT = 44
    const BAR_GAP = 18

    const renderBadge = () => {
        switch (frame.badge) {
            case 'idea':
                return (
                    <Badge className="bg-yellow-500/20 text-lg text-yellow-300">
                        Idea
                    </Badge>
                )
            case 'wireframe':
                return (
                    <Badge className="bg-blue-500/20 text-lg text-blue-300">
                        Wireframe
                    </Badge>
                )
            case 'final':
                return (
                    <Badge className="bg-green-500/20 text-lg text-green-300">
                        Final
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-yellow-500/20 text-lg text-yellow-300">
                        Idea
                    </Badge>
                )
        }
    }

    return (
        <div
            className="absolute pointer-events-auto "
            style={{
                left: pos.x,
                top: pos.y - (BAR_HEIGHT + BAR_GAP) * zoom,
            }}
        >
            {/* SCALE LAYER */}
            <div
                style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    width: frame.width,
                }}
            >
                {/* TOP BAR */}
                <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl bg-black/70 text-white text-sm tracking-tight">

                    {/* LEFT */}
                    <div className="flex items-center gap-3">

                        {/* Device Selector */}
                        <div className=" bg-white/10 rounded-full   transition">
                            <Select defaultValue="Desktop">
                                <SelectTrigger
                                    className="h-auto cursor-pointer  p-4 rounded-full   border-0  text-sm text-white gap-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e1e1e] border border-white/10 text-white">
                                    <SelectItem value="Desktop">Desktop</SelectItem>
                                    <SelectItem value="Tablet">Tablet</SelectItem>
                                    <SelectItem value="Mobile">Mobile</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {renderBadge()}

                        <Separator orientation="vertical" className="h-5 bg-white/20" />

                        {/* Project Name */}
                        <div className="flex items-center gap-2 text-lg px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition">
                            <span className=" uppercase opacity-60 tracking-wide">
                                Project
                            </span>
                            <input
                                type="text"
                                placeholder="Ecommerce Website"
                                className="bg-transparent outline-none  placeholder:text-white/40 w-40"
                            />
                        </div>

                        {/* Description */}
                        <div className="flex items-center text-lg gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition">
                            <span className=" uppercase opacity-60 tracking-wide">
                                Notes
                            </span>
                            <input
                                type="text"
                                placeholder="Describe your idea..."
                                className="bg-transparent outline-none  placeholder:text-white/40 w-44"
                            />
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex gap-2 text-lg">
                        <button className="px-3 cursor-pointer py-1.5 flex items-center gap-2 rounded-md bg-white/20 hover:bg-white/30 transition ">
                            <ImagePlus className="w-4 h-4" />
                            <label
                                htmlFor="fileInput"
                                className='cursor-pointer'
                            >
                                Inspiration
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden cursor-pointer"
                                id="fileInput"
                            />
                        </button>

                        <button className="px-3 py-1.5 flex cursor-pointer items-center gap-2 rounded-md bg-white text-black hover:bg-white/90 transition ">
                            <Sparkles className="w-4 h-4" />
                            Generate
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default FramesOverlay