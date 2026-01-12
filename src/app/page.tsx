import React from 'react'

// Landing Page – Sketcho
// Headline: "A great design is the result of a structured idea / sketch / wireframe"

const Landingpage = () => {
  return (
    <div className="w-full h-screen bg-white text-black">
      
      {/* Navbar */}
      {/* 
      <nav className="p-4 text-2xl">
        Sketcho
      </nav> 
      */}

      {/* Hero Section */}
      <main className="w-full h-full flex items-center justify-center text-center">
        <h1 className="text-8xl font-medium tracking-tighter leading-tight">

          <span className="opacity-40">A</span>{' '}
          <span className="opacity-70">great</span>{' '}
          <span>design</span>
          <br />

          <span className="opacity-50">is the result of a</span>{' '}
          <span>structured</span>{' '}
          <span className="relative">
            idea
            {/* animated underline / word goes here */}
          </span>

        </h1>
      </main>

    </div>
  )
}

export default Landingpage
