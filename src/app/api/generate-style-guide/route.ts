import { NextResponse } from "next/server"
import { spawn } from "child_process"

export async function POST(req: Request) {
  const { imageUrl } = await req.json()

  return new Promise((resolve) => {
    const process = spawn("python", ["D:\\New folder (2)\\sketcho\\Florence\\florence_analyze.py", imageUrl])

    let output = ""
    process.stdout.on("data", (data) => (output += data.toString()))
    process.stderr.on("data", (data) => console.error("Florence Error:", data.toString()))

    process.on("close", () => {
      try {
        const parsed = JSON.parse(output || "{}")
        resolve(NextResponse.json({ result: parsed }))
      } catch (err) {
        console.error("JSON parse error:", err, "Output:", output)
        resolve(NextResponse.json({ error: "AI output invalid" }, { status: 500 }))
      }
    })
  })
}
