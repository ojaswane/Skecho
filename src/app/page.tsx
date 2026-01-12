import React from 'react'
import { SpringMouseFollow } from "../components/ui/skiper-ui/skiper61"
import Image from 'next/image'

const Landingpage = () => {
  return (
    <div className="relative w-full h-screen bg-white text-black overflow-hidden">

      {/* Global spring cursor */}
      <SpringMouseFollow />



      {/* Hero Section */}
      <main className="relative z-10 w-full h-full flex items-center justify-center">
        <h1 className="text-8xl font-medium tracking-tighter leading-tight text-center">

          {/* Line 1 */}
          <div className="flex justify-center gap-3">
            <span className="opacity-40">A</span>
            <span className="opacity-60">great</span>
            <span>design</span>
          </div>

          {/* Line 2 */}
          <div className="flex justify-center items-center gap-3">
            <span className="opacity-60">is</span>
            <span>the</span>

            <div className="relative w-60 h-24 rounded-full bg-black/20 overflow-hidden">
              <Image
                src="/FigmaImage.jpg"
                alt="Design preview"
                fill
                className="object-cover"
                priority
              />
            </div>

            <span>result</span>
            <span className="opacity-50">of</span>
            <span className="opacity-40">a</span>
          </div>

          {/* Line 3 */}
          <div className="flex justify-center gap-3 -mt-4">
            <span>structured</span>
            <span className="relative">idea</span>
          </div>

        </h1>

        <div className="pointer-events-none fixed bottom-[-120px] left-[-80px] z-0 select-none">
          <span className="text-[420px] font-extrabold tracking-tighter text-black/5">
            Sketcho
          </span>
        </div>
      </main>

    </div>
  )
}

export default Landingpage
