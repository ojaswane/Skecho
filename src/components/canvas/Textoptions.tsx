'use client'
import React from 'react'
import { Text, IText, Textbox } from 'fabric'
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
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '../ui/popover'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { UnfoldHorizontal } from 'lucide-react';


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

  const UpdateLetterSpacing = () => {

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
          <label className="uppercase text-[11px] opacity-60 tracking-wide mb-1">
            Line spacing
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline'>
                <Icon path={mdiFormatLineSpacing} size={1} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className='flex gap-4'>
                <UnfoldHorizontal className='w-5' type='letter spacing' />
                <input type="text" className='w-5 border text-center' defaultValue={0} readOnly />
                <Slider
                  defaultValue={[1]}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-40 cursor-pointer"
                  onChange={UpdateLetterSpacing}
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
