import React from 'react'
import { SpringMouseFollow } from "../components/ui/skiper-ui/skiper61"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/Drawer"
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input'

const Landingpage = () => {
  return (
    <div className="relative w-full h-screen bg-white text-black overflow-hidden">

      {/* Global spring cursor */}
      <SpringMouseFollow />

      {/* Hero Section */}
      <main className="relative z-10 w-full h-full flex items-center justify-center">

        <div className="pointer-events-none fixed top-[-200px] right-[-80px] z-0 select-none">
          <span className="text-[350px] font-bold tracking-tighter text-black/5">
            Sketcho
          </span>
        </div>

        <div className='flex flex-col'>
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

          <div className="mt-16 flex flex-col items-center gap-8 text-center">
            <p className="max-w-2xl text-2xl text-black/80 text-left leading-tight">
              Turn rough ideas into structured, editable designs.
              Prompt, sketch, and refine in one seamless canvas.
            </p>

            <div className="flex items-center gap-4">
              {/* Input + Button */}
              <div className="relative w-full max-w-xl">
                <Input
                  placeholder="Your Email"
                  className="
            h-14 rounded-full pl-6 pr-40 text-base
            shadow-[0_12px_30px_rgba(0,0,0,0.08)]
            border border-black/5
          "
                />

                <Button
                  className="
            absolute right-2 top-1/2 -translate-y-1/2
            h-10 px-6 rounded-full
            bg-black text-white
            shadow-[0_10px_25px_rgba(0,0,0,0.25)]
            hover:bg-black/90
          "
                >
                  Join Waitlist
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3 text-sm text-black/70">

                {/* Avatars */}
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
                  Joined by <strong>500+</strong> Designer's & Saas founders
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none fixed bottom-[-150px] left-[-80px] z-0 select-none">
          <span className="text-[350px] font-bold tracking-tighter text-black/5">
            Sketcho
          </span>
        </div>
      </main>

    </div>
  )
}

export default Landingpage
