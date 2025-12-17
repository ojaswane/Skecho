'use client'
import React from 'react'
import { Text, IText, Textbox } from 'fabric'
import * as fabric from 'fabric'
import { Combobox } from '../ui/Combobox'
import {
  TextAlignStart,
  TextAlignCenter,
  TextAlignEnd,
} from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../ui/select'

import { useCanvasStore } from '../../../lib/store/canvasStore'
import { SelectValue } from '@radix-ui/react-select'
import Icon from '@mdi/react';
import { mdiFormatLineSpacing } from '@mdi/js';


type TextAlign = 'left' | 'center' | 'right'
const Textoptions = () => {
  const canvas = useCanvasStore((s) => s.canvas)

  type FabricTextObject = Text | IText | Textbox

  const isFabricTextObject = (obj: unknown): obj is FabricTextObject => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'type' in obj &&
      (
        (obj as any).type === 'text' ||
        (obj as any).type === 'i-text' ||
        (obj as any).type === 'textbox'
      )
    )
  }


  const updateTextAlign = (value: TextAlign) => {
    if (!canvas) return

    const obj = canvas.getActiveObject()
    if (!isFabricTextObject(obj)) return

    obj.textAlign = value
    canvas.requestRenderAll()
  }


  return (
    <div className="space-y-4">

      {/* Font Family */}
      <div className="flex flex-col text-white">
        <label className="uppercase text-[11px] opacity-60 tracking-wide">
          Font Family
        </label>
        <Combobox />
      </div>

      <div className='flex '>
        {/* Text Alignment */}
        <div className="flex flex-col text-white">
          <label className="uppercase text-[11px] opacity-60 tracking-wide mb-1">
            Text Align
          </label>

          <Select
            defaultValue="left"
            onValueChange={(value) => updateTextAlign(value as TextAlign)}
          >
            <SelectTrigger className="h-9 bg-zinc-900 border-zinc-700" >
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-zinc-900 border-zinc-700">
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

          {/* Adding the Line spacing */}

        </div>
        <div className='flex flex-col'>
          {/* <Icon path={mdiFormatLineSpacing} size={1} /> */}
          <label className="uppercase text-[11px] opacity-60 tracking-wide mb-1">
            Line spacing
          </label>

          

        </div>
      </div>
    </div>
  )
}

export default Textoptions
