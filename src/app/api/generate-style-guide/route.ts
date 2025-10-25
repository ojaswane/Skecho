import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

//function to send to the Open Ai
const POST = async (req: Request) => {
    try {
        const { imageUrl, figmaUrl } = await req.json()

        let prompt = `
You are a professional UI designer. Before analyzing, if the image quality of this design (${imageUrl || figmaUrl}) is low or unclear, 
please enhance it mentally to high quality and then proceed with the analysis. 

Analyze the design and extract the following:
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
        console.error("There is an error in Open Ai response with this error: ", err)
        return NextResponse.json({ error: "Failed to generate style guide" }, { status: 500 })
    }
}

export default POST
