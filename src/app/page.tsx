import React from 'react'

// Landing Page – Sketcho
// Headline: "A great design is the result of a structured idea / sketch / wireframe"

const Landingpage = () => {
  return (
    <div className="w-full h-screen bg-white text-black">

      {/* Hero Section */}
      <main className="w-full h-full flex items-center justify-center">
        <h1 className="text-8xl font-medium tracking-tighter leading-tight text-center">

          {/* Line 1 */}
          <div className="flex justify-center gap-3">
            <span className="opacity-40">A</span>
            <span className="opacity-70">great</span>
            <span>design</span>
          </div>

          {/* Line 2 */}
          <div className="flex  justify-center items-center gap-3 ">
            <span className='opacity-70'>
              is
            </span>
            <span className='opacity-100'>
              the
            </span>

            {/* Image / visual placeholder */}
            <div className="w-60 h-25 rounded-full bg-black/20">
              {/* image goes here */}
              <img src="" />
            </div>

            <span>
              result of a
            </span>
          </div>

          {/* Line 3 */}
          <div className="flex justify-center gap-3 -mt-4">
            <span>structured</span>

            {/* Animated word */}
            <span className="relative">
              idea
              {/* animated underline / word swap here */}
            </span>
          </div>

        </h1>
      </main>

    </div>
  )
}

export default Landingpage
