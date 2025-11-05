'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut } from 'lucide-react'

const ZoomBar = () => {
    const handleZoomOut = () => {
        console.log('Zooming out...')
        // Add your zoom-out logic here
    }

    const handleZoomIn = () => {
        console.log('Zooming in...')
    }

    return (
        <div className="col-span-1 flex justify-end items-center">
            <div
                className="flex items-center gap-1 backdrop-blur-xl bg-white/10 
        border border-white/10 rounded-full p-1 saturate-150"
            >
                {/* TODO : Add the zoom percentage */}
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleZoomOut}
                    className="w-9 h-9 p-0 rounded-full cursor-pointer 
          hover:bg-white/10 hover:border-white/20 border border-transparent transition-all"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4 text-primary/50" />
                </Button>

                <span className='mx-1 h-5 w-px rounded bg-white/[0.16]' />
                
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleZoomIn}
                    className="w-9 h-9 p-0 rounded-full cursor-pointer 
          hover:bg-white/10 hover:border-white/20 border border-transparent transition-all"
                    title="Zoom Out"
                >
                    <ZoomIn className="w-4 h-4 text-primary/50" />
                </Button>
            </div>
        </div>
    )
}

export default ZoomBar
