import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { imageUrl } = await req.json()

        if (!imageUrl) {
            return NextResponse.json({ error: "No image URL provided" }, { status: 400 })
        }

        const HF_TOKEN = process.env.HUGGINGFACE_TOKEN
        const model = "microsoft/Florence-2-large"


        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: {
                    image: imageUrl,
                    prompt: `Analyze this UI design image and extract:
          1. If the image is low quality, improve resolution first.
          2. Brand color palette (with hex codes)
          3. Font styles (names, weights, usage)
          4. UI component color roles.
          Return ONLY clean JSON in this format:
          {
            "colors": [ {"name": "", "hex": "", "role": ""} ],
            "typography": [ {"font": "", "weight": "", "use": ""} ]
          }`,
                },
            }),
        })

        if (!response.ok) {
            const errText = await response.text()
            console.error("Florence API Error Response:", errText)
            return NextResponse.json({ error: "Model API failed", details: errText }, { status: 500 })
        }

        const result = await response.json()
        const output =
            result?.[0]?.generated_text ||
            result?.generated_text ||
            JSON.stringify(result, null, 2)

        return NextResponse.json({ output })
    } catch (error) {
        console.error("Florence API Error:", error)
        return NextResponse.json({ error: "Something went wrong with Florence." }, { status: 500 })
    }
}
