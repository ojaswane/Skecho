import React from 'react'
import { SpringMouseFollow } from "../components/ui/skiper-ui/skiper61"
import Image from 'next/image'

const Landingpage = () => {
  return (
    <div className="relative w-full h-screen bg-white text-black overflow-hidden">

      {/* Global spring cursor */}
      <SpringMouseFollow />

      {/* Hero Section */}
      <main className="w-full h-full flex items-center justify-center">
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

            <div className="w-60 h-24 rounded-full bg-black/20 overflow-hidden">
              <Image
                src="/image.jpg"
                width={10}
                height={10}
                alt="Description of the image"
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
      </main>

    </div>
  )
}

export default Landingpage
