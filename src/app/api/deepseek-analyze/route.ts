import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    const model = "deepseek-ai/DeepSeek-VL-7B"; // ✅ latest available visual model

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: imageUrl },
              {
                type: "text",
                text: `Analyze this UI design and return a clean JSON with:
                1. Color palette (with HEX values)
                2. Font families and weights
                3. Design style (e.g. minimal, modern, playful)
                STRICTLY return JSON only like:
                {
                  "colors": [{"hex": "", "role": ""}],
                  "fonts": [{"name": "", "weight": ""}],
                  "style": ""
                }`,
              },
            ],
          },
        ],
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error("DeepSeek API Error:", raw);
      return NextResponse.json(
        { error: "Model API failed", details: raw },
        { status: 500 }
      );
    }

    // Try to extract the JSON from the model’s response
    let resultText = "";
    try {
      const parsed = JSON.parse(raw);
      resultText =
        parsed?.[0]?.generated_text ||
        parsed?.generated_text ||
        JSON.stringify(parsed, null, 2);
    } catch {
      resultText = raw;
    }

    // Extract JSON substring if wrapped in text
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const finalOutput = jsonMatch ? JSON.parse(jsonMatch[0]) : resultText;

    return NextResponse.json({ output: finalOutput });
  } catch (error) {
    console.error("DeepSeek Analyze Error:", error);
    return NextResponse.json(
      { error: "Something went wrong while analyzing image." },
      { status: 500 }
    );
  }
}
