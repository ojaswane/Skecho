'use client'

import React from 'react'
import { Redo2, Undo2 } from 'lucide-react'

const HistoryPill = () => {
    return (
        <div className="col-span-0 flex justify-start items-center">
            <div
                className="inline-flex items-center rounded-full backdrop-blur-xl 
        dark:bg-white/10 border dark:border-white/10 dark:text-neutral-300 bg-black/30  border-black/20 text-black  saturate-150 p-1"
                aria-hidden
            >
                <span
                    className="inline-grid h-9 w-9 place-items-center rounded-full 
          dark:hover:bg-white/10 hover:bg-black/10 dark:hover:text-white hover:text-black/10  transition-all cursor-pointer"
                >
                    <Undo2 size={15} className="opacity-80 stroke-[1.75]" />
                </span>
                <span className='mx-1 h-5 w-px rounded bg-white/[0.16] hover:bg-black-20' />
                <span
                    className="inline-grid h-9 w-9 place-items-center rounded-full 
          dark:hover:bg-white/10 hover:bg-black/10 dark:hover:text-white hover:text-black/10 transition-all cursor-pointer"
                >
                    <Redo2 size={15} className="opacity-80 stroke-[1.75]" />
                </span>
            </div>
        </div>
    )
}

export default HistoryPill
