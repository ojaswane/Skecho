import "dotenv/config"
import express from "express"
console.log("✓ Express loaded")

import cors from "cors"
console.log("✓ CORS loaded")

import http from "http"
console.log("✓ HTTP loaded")

try {
    import generateRoute from "./routes/PreviewGemini.js"
    console.log("✓ PreviewGemini route loaded")
} catch (e: any) {
    console.error("✗ PreviewGemini error:", e.message)
}

try {
    import realtimeRoute from "./routes/realtime.js"
    console.log("✓ Realtime route loaded")
} catch (e: any) {
    console.error("✗ Realtime error:", e.message)
}

try {
    import realtimeAiRoute from "./routes/RealtimeAi.js"
    console.log("✓ RealtimeAi route loaded")
} catch (e: any) {
    console.error("✗ RealtimeAi error:", e.message)
}

try {
    import { attachRealtimeWSServer } from "./realtime/wsServer.js"
    console.log("✓ WebSocket server loaded")
} catch (e: any) {
    console.error("✗ WebSocket server error:", e.message)
}

console.log("✓ All imports successful!")
