import "dotenv/config"
import express from "express"
import cors from "cors"
import http from "http"
import generateRoute from "./routes/PreviewGemini.js"
import realtimeRoute from "./routes/realtime.js"
import realtimeAiRoute from "./routes/RealtimeAi.js"
import { attachRealtimeWSServer } from "./realtime/wsServer.js"

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/generate", generateRoute);
app.use("/realtime", realtimeRoute);
app.use("/realtime-ai", realtimeAiRoute);

const PORT = process.env.PORT || 3001;
attachRealtimeWSServer(server);

server.on("error", (err: any) => {
    if (err?.code === "EADDRINUSE") {
        console.error(`[backend] Port ${PORT} is already in use. Stop the other backend process or change PORT in backend/.env.`);
        process.exit(1);
    }
    console.error("[backend] Server error:", err);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
});
