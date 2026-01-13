'use client'

import React from 'react'
import Image from 'next/image'
import { SpringMouseFollow } from "../components/ui/skiper-ui/skiper61"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'


const Landingpage = () => {
  return (
    <div className="relative w-full bg-white text-black overflow-hidden">

      {/* Spring cursor */}
      <SpringMouseFollow />

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full min-h-screen flex items-center justify-center">

        {/* Background word (top) */}
        <div className="pointer-events-none fixed top-[-180px] right-[-120px] select-none">
          <span className="text-[320px] font-bold tracking-tighter text-black/5">
            Sketcho
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">

          {/* Heading */}
          <h1 className="text-[88px] font-medium tracking-tighter leading-[0.95]">

            <div className="flex justify-center gap-3">
              <span className="opacity-40">A</span>
              <span className="opacity-60">great</span>
              <span>design</span>
            </div>

            <div className="flex justify-center items-center gap-3 mt-2">
              <span className="opacity-60">is</span>
              <span>the</span>

              {/* Image pill */}
              <div className="relative w-56 h-20 rounded-full bg-black/10 overflow-hidden">
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

            <div className="flex justify-center items-end gap-3 mt-1">
              <span>structured</span>
              <span className="font-parisienne text-8xl text-orange-500 leading-none">
                Idea.
              </span>
            </div>

          </h1>

          {/* Description */}
          <p className="mt-10 max-w-xl text-lg text-black/70 leading-snug">
            Turn rough ideas into structured, editable designs.
            Prompt, sketch, and refine — all in one seamless canvas.
          </p>

          {/* Email CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 w-full">

            <div className="relative w-full max-w-xl">
              <Input
                placeholder="xyz@gmail.com"
                className="
                  h-16
                  rounded-full
                  pl-6 pr-40
                  text-base
                  shadow-[0_14px_40px_rgba(0,0,0,0.12)]
                  border border-black/10
                  placeholder:text-black/40
                  focus-visible:ring-0
                "
              />

              <Button
                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  h-12
                  px-8
                  text-sm
                  font-semibold
                  rounded-full
                  bg-black text-white
                  shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                  hover:bg-black/90
                "
              >
                Join Waitlist
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 text-sm text-black/70">
              <div className="flex -space-x-2">
                <Image src="/avatar1.jpg" alt="" width={36} height={36} className="rounded-full border border-white object-cover" />
                <Image src="/avatar2.jpg" alt="" width={36} height={36} className="rounded-full border border-white object-cover" />
                <Image src="/avatar3.jpg" alt="" width={36} height={36} className="rounded-full border border-white object-cover" />
              </div>

              <span>
                Joined by <strong>500+</strong> designers & SaaS founders
              </span>
            </div>
          </div>
        </div>

        {/* Background word (bottom) */}
        <div className="pointer-events-none fixed bottom-[-160px] left-[-120px] select-none">
          <span className="text-[320px] font-bold tracking-tighter text-black/5">
            Sketcho
          </span>
        </div>

      </section>

    </div>
  )
}

export default Landingpage
