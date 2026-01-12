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
              Sketcho helps you turn rough ideas into structured, editable designs instantly.
              Prompt, sketch, or experiment freely, then refine everything visually in one seamless canvas.
            </p>

            <div className="flex items-center gap-4">
              <Drawer >
                <Button className="bg-black text-white hover:bg-black/20 cursor-pointer px-8 py-6 text-lg rounded-full hover:scale-[1.02] transition">
                  <DrawerTrigger className='cursor-pointer flex justify-center items-center'>
                    Join Early Access
                    <ArrowRight className="ml-2" />
                  </DrawerTrigger>
                </Button>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                    <DrawerDescription>Once you presigned-in , you'll be notified the moment the App is launched</DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <Button>Submit</Button>
                    <DrawerClose>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
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
