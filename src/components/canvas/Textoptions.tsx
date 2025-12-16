'use client'
import React from 'react'
import { Combobox } from '../ui/Combobox'
import { TextAlignStart } from 'lucide-react'
import { TextAlignEnd } from 'lucide-react'
import { TextAlignCenter } from 'lucide-react'

const Textoptions = () => {
  return (
    <>
      <div className='-mt-2 flex flex-col text-white'>
        <label className='uppercase text-[11px] opacity-60 tracking-wide'>
          Font Family
        </label>
        <div>
          <Combobox />
        </div>
      </div>

      {/* text alignment + line spacing */}
      <div className='mt-3 flex flex-col text-white'>
        <div>
          <label className='uppercase text-[11px] opacity-60 tracking-wide'>
            text align
          </label>

          <div>
            
          </div>
        </div>
      </div>
    </>

  )
}

export default Textoptions