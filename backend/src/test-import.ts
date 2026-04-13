import { GenerateRealTimeAi } from "./Ai/RealTime_Ai.js"

console.log("✓ Import successful")
console.log("GenerateRealTimeAi function:", typeof GenerateRealTimeAi)

// Quick test
try {
    const result = await GenerateRealTimeAi({ prompt: "test" })
    console.log("✓ Function executable (but will fail without API key)")
} catch (error: any) {
    if (error.message.includes("GEMINI_API_KEY")) {
        console.log("✓ Function works - correctly threw missing API key error")
    } else {
        console.error("✗ Unexpected error:", error.message)
    }
}
