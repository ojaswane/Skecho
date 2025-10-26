import { NextResponse } from "next/server"
import { spawn } from "child_process"

export async function POST(req: Request) {
  const { imageUrl } = await req.json()

  return new Promise((resolve) => {
    const process = spawn("python", ["Florence.py", imageUrl])

    let output = ""
    process.stdout.on("data", (data) => (output += data.toString()))
    process.stderr.on("data", (data) => console.error("Florence Error:", data.toString()))

    process.on("close", () => {
      resolve(NextResponse.json({ result: JSON.parse(output) }))
    })
  })
}
