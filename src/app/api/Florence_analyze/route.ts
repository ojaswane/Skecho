import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    const model = "microsoft/Florence-2-large";

    // Call Hugging Face Inference API
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: {
          text: `Analyze this UI design image and extract:
          1. Brand color palette (with hex codes)
          2. Font styles (names, weights, usage)
          3. UI component color roles.
          Return clean JSON only in this format:
          {
            "colors": [ {"name": "", "hex": "", "role": ""} ],
            "typography": [ {"font": "", "weight": "", "use": ""} ]
          }`,
          image: imageUrl,
        },
      }),
    });

    const result = await response.json();

    // Parse response safely
    const output = result?.[0]?.generated_text || result?.generated_text || result;
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Florence API Error:", error);
    return NextResponse.json({ error: "Something went wrong with Florence." }, { status: 500 });
  }
}
