'use client'
import React from 'react'
import { useCanvasStore } from '../../../lib/store/canvasStore'
import { ALL_FONTS } from './data/Fontfamily'

const Textoptions = () => {
  return (
    <div className='-mt-2 flex flex-col text-white'>
      <label className='uppercase text-[11px] opacity-60 tracking-wide '>
        Font Family
      </label>
      <select
        // value={}
        // onChange={}
        className="
                    mt-1 w-43 h-10
                        bg-white/10 border border-white/20
                        rounded-md px-2
                        focus:outline-none focus:ring-1 focus:ring-white/40
                        p-2
                        cursor-pointer
                        "
      >
        {ALL_FONTS.map((font: any) => (
          <option key={font.family} value={font.family} className='text-white bg-black mt-2'>
            {font.family}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Textoptions