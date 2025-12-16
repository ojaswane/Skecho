'use client'
import React from 'react'
import { ALL_FONTS } from './data/Fontfamily'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Textoptions = () => {
  return (
    <div className='-mt-2 flex flex-col text-white'>
      <label className='uppercase text-[11px] opacity-60 tracking-wide'>
        Font Family
      </label>

      <Select defaultValue="Arial">
        <SelectTrigger className="w-[180px] bg-white/10 border-white/20">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>

        <SelectContent className="max-h-40 overflow-y-auto">
          <SelectGroup>
            <SelectLabel>Fonts</SelectLabel>

            {ALL_FONTS.map((font: string) => (
              <SelectItem
                key={font}
                value={font}
                style={{ fontFamily: font }}
              >
                {font}
              </SelectItem>
            ))}

          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default Textoptions