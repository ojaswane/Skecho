'use client'

import React from 'react'
import Image from 'next/image'
import { SpringMouseFollow } from "../components/ui/skiper-ui/skiper61"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const Landingpage = () => {
  return (
    <div className="relative w-full h-screen bg-white text-black overflow-hidden">

      {/* Spring cursor */}
      <SpringMouseFollow />

      <main className="relative z-10 w-full h-full flex items-center justify-center">

        {/* Background word */}
        <div className="pointer-events-none fixed top-[-200px] right-[-80px] select-none">
          <span className="text-[350px] font-bold tracking-tighter text-black/5">
            Sketcho
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center">

          {/* Heading */}
          <h1 className="text-8xl font-medium tracking-tighter leading-tight text-center">
            <div className="flex justify-center gap-3">
              <span className="opacity-40">A</span>
              <span className="opacity-60">great</span>
              <span>design</span>
            </div>

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

            <div className="flex justify-center gap-3 -mt-4">
              <span>structured</span>
              <span>idea</span>
            </div>
          </h1>

          {/* Description */}
          <p className="mt-16 max-w-2xl text-2xl text-black/80 text-center leading-tight">
            Turn rough ideas into structured, editable designs.
            Prompt, sketch, and refine in one seamless canvas.
          </p>

          {/* Email CTA */}
          <div className="mt-16 flex flex-col items-center gap-6 w-full">

            {/* Input Wrapper */}
            <div className="relative w-full max-w-2xl">
              <Input
                placeholder="Enter your email"
                className="
                  h-20
                  rounded-full
                  pl-8 pr-56
                  text-xl
                  font-medium
                  shadow-[0_20px_50px_rgba(0,0,0,0.12)]
                  border border-black/10
                  placeholder:text-black/40
                  focus-visible:ring-0
                  focus-visible:ring-offset-0
                "
              />

              <Button
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  h-14
                  px-10
                  text-lg
                  font-semibold
                  rounded-full
                  bg-black text-white
                  shadow-[0_15px_40px_rgba(0,0,0,0.35)]
                  hover:bg-black/90
                "
              >
                Join Waitlist
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 text-sm text-black/70">
              <div className="flex -space-x-2">
                <Image
                  src="/avatar1.jpg"
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full border border-white"
                />
                <Image
                  src="/avatar2.jpg"
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full border border-white"
                />
                <Image
                  src="/avatar3.jpg"
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full border border-white"
                />
              </div>

              <span>
                Joined by <strong>500+</strong> designers & SaaS founders
              </span>
            </div>
          </div>
        </div>

        {/* Bottom background word */}
        <div className="pointer-events-none fixed bottom-[-150px] left-[-80px] select-none">
          <span className="text-[350px] font-bold tracking-tighter text-black/5">
            Sketcho
          </span>
        </div>

      </main>
    </div>
  )
}

export default Landingpage