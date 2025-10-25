import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ✅ Correct: Named export for the POST method
export async function POST(req: Request) {
  try {
    const { imageUrl, figmaUrl } = await req.json()

    const prompt = `
      You are a professional UI designer. 
      Before analyzing, if the image quality of this design (${imageUrl || figmaUrl}) is low or unclear, 
      mentally enhance it to high quality and then proceed.

      Analyze the design and extract:
      1. Brand's color palette (with hex codes)
      2. Font styles (names, weights, and usage)
      3. UI component color roles

      Return a JSON like:
      {
        "colors": [
          { "name": "Lavender Dream", "hex": "#E8D5F2", "role": "primary", "purpose": "Soft purple for headers and primary elements" }
        ],
        "typography": [
          { "font": "Manrope", "weight": "500", "use": "headings" }
        ]
      }
    `

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: prompt,
    })

    const styleGuide = response.output_text || "No output"

    return NextResponse.json({ styleGuide })
  } catch (err) {
    console.error("❌ OpenAI API error:", err)
    return NextResponse.json(
      { error: "Failed to generate style guide" },
      { status: 500 }
    )
  }
}
