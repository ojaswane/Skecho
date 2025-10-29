import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { base64 } = await req.json();
    if (!base64) throw new Error("Missing base64 image data.");

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

    // Use direct REST API (v1)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: base64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error?.message || "Gemini API error: " + JSON.stringify(result)
      );
    }

    const output =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No readable response.";

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}