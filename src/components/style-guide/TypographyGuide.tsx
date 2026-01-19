"use client"

import React, { useState, useEffect } from "react"

export const fonts = [
  "Inter",
  "Manrope",
  "Poppins",
  "Roboto",
  "Montserrat",
  "Lato",
  "Nunito",
]

const weights = [
  { label: "Extra Light", value: 200 },
  { label: "Light", value: 300 },
  { label: "Regular", value: 400 },
  { label: "Medium", value: 500 },
  { label: "Semi Bold", value: 600 },
  { label: "Bold", value: 700 },
  { label: "Extra Bold", value: 800 },
]

export default function TypographyGuide() {
  const [selectedFont, setSelectedFont] = useState("Manrope")

  // 🧠 Load font dynamically from Google Fonts
  useEffect(() => {
    const fontLink = document.createElement("link")
    fontLink.rel = "stylesheet"
    fontLink.href = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(
      / /g,
      "+"
    )}:wght@200;300;400;500;600;700;800&display=swap`
    document.head.appendChild(fontLink)

    // Cleanup previous font link when font changes
    return () => {
      document.head.removeChild(fontLink)
    }
  }, [selectedFont])

  return (
    <div className="text-gray-200 space-y-8 bg-[#111111] p-6 rounded-2xl mt-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Typography Style Guide</h1>
        <p className="text-gray-400 text-sm">
          Explore and test typography used in your design system.
        </p>
      </div>

      {/* Font Selector */}
      <div>
        <label htmlFor="font" className="text-sm text-gray-400">
          Select Font Family
        </label>
        <select
          id="font"
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          className="mt-2 bg-neutral-900 text-gray-100 border border-gray-700 rounded-lg px-3 py-2"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Display */}
      <div className="space-y-6">
        {weights.map((w) => (
          <div key={w.value}>
            <p className="text-xs text-gray-400 mb-1">
              {w.label} ({w.value})
            </p>
            <p
              style={{
                fontFamily: `'${selectedFont}', sans-serif`,
                fontWeight: w.value,
              }}
              className="text-3xl sm:text-4xl leading-snug text-gray-100"
            >
              Whereas disregard and contempt for human rights have resulted
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
