'use client'
import React from 'react'
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
  SelectValue,
} from '../ui/select'

const Textoptions = () => {
  return (
    <div className="space-y-4">

      {/* Font Family */}
      <div className="flex flex-col text-white">
        <label className="uppercase text-[11px] opacity-60 tracking-wide">
          Font Family
        </label>
        <Combobox />
      </div>

      {/* Text Alignment */}
      <div className="flex flex-col text-white">
        <label className="uppercase text-[11px] opacity-60 tracking-wide mb-1">
          Text Align
        </label>

        <Select defaultValue="left">
          <SelectTrigger className="h-9 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>

          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="left" className="flex items-center gap-2">
              <TextAlignStart size={16} />
            </SelectItem>

            <SelectItem value="center" className="flex items-center gap-2">
              <TextAlignCenter size={16} />
            </SelectItem>

            <SelectItem value="right" className="flex items-center gap-2">
              <TextAlignEnd size={16} />
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  )
}

export default Textoptions