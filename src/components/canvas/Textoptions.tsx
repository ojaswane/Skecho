'use client'
import React from 'react'
import { Combobox } from '../ui/Combobox'

const Textoptions = () => {
  return (
    <div className='-mt-2 flex flex-col text-white'>
      <label className='uppercase text-[11px] opacity-60 tracking-wide'>
        Font Family
      </label>
      <div>
        <Combobox />
      </div>
    </div>
  )
}

export default Textoptions