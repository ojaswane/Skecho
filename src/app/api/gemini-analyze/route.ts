import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { base64 } = await req.json();
    if (!base64) throw new Error("Image base64 missing");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Analyze this UI design image and extract:
      1. Brand color palette (with hex codes)
      2. Font styles (names and weights)
      Return ONLY clean JSON in this format:
      {
        "colors": [{"name": "", "hex": "", "role": ""}],
        "typography": [{"font": "", "weight": "", "use": ""}]
      }
    `;

    const result = await model.generateContent([
      {
        text: prompt,
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: base64,
        },
      },
    ]);


    const output = result.response.text();
    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
