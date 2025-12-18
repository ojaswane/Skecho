"use client"
import React, { useEffect, useState } from "react"
import { Text, IText, Textbox } from "fabric"
import { Combobox } from "../ui/Combobox"
import {
  TextAlignStart,
  TextAlignCenter,
  TextAlignEnd,
  UnfoldHorizontal,
} from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

import { useCanvasStore } from "../../../lib/store/canvasStore"
import Icon from "@mdi/react"
import { mdiFormatLineSpacing } from "@mdi/js"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Button } from "../ui/button"
import { Slider } from "../ui/slider"

type TextAlign = "left" | "center" | "right"

const Textoptions = () => {
  const canvas = useCanvasStore((s) => s.canvas)
  const [letterSpace, setLetterSpace] = useState(0)

  type FabricTextObject = Text | IText | Textbox

  const isFabricTextObject = (obj: unknown): obj is FabricTextObject => {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "type" in obj &&
      ["text", "i-text", "textbox"].includes((obj as any).type)
    )
  }

  const updateTextAlign = (value: TextAlign) => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!isFabricTextObject(obj)) return
    obj.textAlign = value
    canvas.requestRenderAll()
  }

  const updateLetterSpacing = (value: number[]) => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!isFabricTextObject(obj)) return

    setLetterSpace(value[0])
    obj.set("charSpacing", value[0] * 10)
    obj.initDimensions()
    obj.setCoords()
    canvas.requestRenderAll()
  }


// when ever i de-select the object then the ui should hold the value of prev

  useEffect(() => {
    if (!canvas) return

    const syncFromCanvas = () => {
      const obj = canvas.getActiveObject()
      if (!isFabricTextObject(obj)) {
        setLetterSpace(0)
        return
      }

      setLetterSpace(obj.charSpacing / 10)
    }

    canvas.on("selection:created", syncFromCanvas)
    canvas.on("selection:updated", syncFromCanvas)
    canvas.on("selection:cleared", syncFromCanvas)

    return () => {
      canvas.off("selection:created", syncFromCanvas)
      canvas.off("selection:updated", syncFromCanvas)
      canvas.off("selection:cleared", syncFromCanvas)
    }
  }, [canvas])


  return (
    <div className="space-y-5">

      {/* Font Family */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-wide opacity-60">
          Font Family
        </label>
        <Combobox />
      </div>


      <div className="flex gap-3 items-end">

        {/* Text Align */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide opacity-60">
            Text Align
          </label>

          <Select
            defaultValue="left"
            onValueChange={(value) => updateTextAlign(value as TextAlign)}
          >
            <SelectTrigger
              className="h-8 w-20 bg-white/10 border-white/20"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="left">
                <TextAlignStart size={16} />
              </SelectItem>
              <SelectItem value="center">
                <TextAlignCenter size={16} />
              </SelectItem>
              <SelectItem value="right">
                <TextAlignEnd size={16} />
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Letter Spacing */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide opacity-60">
            <div className=" w-30">
              Letter Spacing
            </div>
          </label>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9   w-20 bg-white/10 border-white/20"
              >
                <Icon path={mdiFormatLineSpacing} size={0.9} />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-3">
              <div className="flex items-center gap-3">
                <UnfoldHorizontal className="w-4 opacity-70" />

                <input
                  type="text"
                  value={letterSpace.toFixed()}
                  readOnly
                  className="
                    w-10 h-8 text-center text-sm
                    bg-white/10 border border-white/20
                    rounded
                  "
                />

                <Slider
                  value={[letterSpace]}
                  min={-100}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={updateLetterSpacing}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

      </div>
    </div>
  )
}

export default Textoptions