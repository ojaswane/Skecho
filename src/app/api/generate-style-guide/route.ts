import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

//function to send to the open Ai
const POST = async (req: Request) => {
    const { imageUrl, figmaUrl } = await req.json()

    let prompt = `
  You are a professional UI designer. Analyze this design (${imageUrl || figmaUrl}) 
  and extract the brand's color palette (with hex codes), 
  font styles (names, weights, uses), and UI component color roles.
  Return a JSON like:
  {
    "colors": [{ "name": "Lavender Dream", "hex": "#E8D5F2", "role": "primary","purpose" :"Soft purple for headers and primary elements" }],
    "typography": [{ "font": "Manrope", "weight": "500", "use": "headings" }]
  }
  `
    const Response = await openai.responses.create({
        model: "gpt-4.1",
        input: prompt,
    })
    const json = JSON.parse(Response.output[0].content[0].text)
    return NextResponse.json(json)
}

export default POST