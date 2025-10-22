"use client"

import React, { useState } from "react"

const fonts = [
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

    return (
        <div className="text-gray-200 space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Style Guide</h1>
                <p className="text-gray-400 text-sm">Explore typography used in your design system.</p>
            </div>

            <div>
                <label htmlFor="font" className="text-sm text-gray-400">
                    Font
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

            <div className="space-y-6">
                {weights.map((w) => (
                    <div key={w.value}>
                        <p className="text-xs text-gray-400 mb-1">{w.label}</p>
                        <p
                            style={{
                                fontFamily: selectedFont,
                                fontWeight: w.value,
                            }}
                            className="text-lg"
                        >
                            Whereas disregard and contempt for human rights have resulted
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
