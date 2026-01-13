'use client'

import React from 'react'
import { SpringMouseFollow } from "../components/ui/skiper-ui/skiper61"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseclient'

const Landingpage = () => {
  const [loading, setLoading] = React.useState(false)

  const handlePresignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const input = form.querySelector('input') as HTMLInputElement | null
    const email = input?.value.trim()

    if (!email) {
      setLoading(false)
      return
    }

    const { error } = await supabase.from('PreSignUp').insert([{ email }])

    if (!error) {
      form.reset()
    }

    setLoading(false)
  }

  return (
    <div className="relative w-full bg-white text-black overflow-hidden">
      <SpringMouseFollow />

      {/* HERO */}
      <section className="relative w-full min-h-screen">

        {/* DOTTED CENTER GUIDES */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute left-1/2 top-0 h-full border-l border-dotted border-black/20" />
          <div className="absolute top-[160px] left-0 w-full border-t border-dotted border-black/20" />
        </div>

        {/* BACKGROUND WORD */}
        <div className="pointer-events-none fixed top-[-200px] right-[-120px] select-none">
          <span className="text-[320px] font-medium tracking-[-0.09em] text-black/10">
            Sketcho
          </span>
        </div>

        {/* CONTENT WRAPPER — MOVED LEFT */}
        <div className="relative  z-10 max-w-[1440px] pl-10 pr-24 pt-[250px]">

          {/* HEADING + BUTTON ROW */}
          <div className="flex items-start justify-between">

            {/* HEADING FRAME */}
            <div className="relative">

              {/* SELECTION BOX */}
              <div className="pointer-events-none absolute inset-0">
                <div className="w-[1500px] h-[400px] border border-sky-500 rounded relative">
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] px-1.5 py-[1px] rounded-sm bg-sky-600 text-white">
                    1260 × 358
                  </div>
                </div>
              </div>

              {/* TEXT */}
              <h1
                className="
                  w-[2000px] h-[358px]
                  flex flex-col justify-center
                  text-[150px]
                  font-medium
                  tracking-[-0.09em]
                  leading-[0.95]
                  text-left
                  font-bricolage
                "
              >
                <span
                  className="
                    underline decoration-sky-400 decoration-[2px]
                    underline-offset-[2px]
                    relative z-10
                  "
                >
                  A great design
                </span>

                <div
                  className="
                    flex gap-4 mt-[6px]
                    underline decoration-sky-400 decoration-[2px]
                    underline-offset-[2px]
                    relative z-10
                  "
                >
                  <span>is the result of a structured</span>
                </div>

                <div className="mt-[2px]">
                  <span
                    className="
                      font-instrument
                      italic
                      text-[150px]
                      tracking-[-0.02em]
                      leading-none
                    "
                  >
                    Sketch of your idea .
                  </span>
                </div>
              </h1>
            </div>
          </div>

          {/* DESCRIPTION + CTA */}
          <div className="flex items-center justify-between w-">

            {/* DESCRIPTION */}
            <p className="mt-25 max-w-[520px] text-[26px] tracking-[-0.09em]  leading-[1.45] text-black/70">
              Turn rough ideas into structured, editable designs.
              Prompt, sketch, and refine — all in one seamless canvas.
            </p>

            {/* CTA BUTTON */}
            <form
              onSubmit={handlePresignUp}
              className="relative mt-6"
            >
              <Button
                type="submit"
                disabled={loading}
                className="
                  h-10 px-6 rounded-full
                  bg-black text-white mt-25
                  text-xl tracking-[-0.09em]
                  p-10
                "
              >
                {loading ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </form>
          </div>
        </div>

        {/* BOTTOM BG WORD */}
        <div className="pointer-events-none fixed bottom-[-160px] left-[-120px] select-none">
          <span className="text-[320px] font-medium tracking-[-0.09em] text-black/10">
            Sketcho
          </span>
        </div>
      </section>
    </div>
  )
}

export default Landingpage
