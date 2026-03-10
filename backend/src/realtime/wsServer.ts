// 0: connecting
// 1: open
// 2: closing
// 3: closed

import type { Server as HttpServer } from "http"
import { WebSocketServer } from "ws"
import { GenerateRealTimeAi } from "../Ai/RealTime_Ai.js"
import {
  applySessionPatch,
  createSession,
  getSession,
  updateSessionSeq,
  upsertSessionDoc,
} from "./sessionStore.js"
import type { AiDocument } from "./protocol.js"

type ClientMessage =
  | {
    type: "session.start";
    frameId: string;
    requestId?: string
  }
  | {
    type: "sketch.delta";
    frameId: string; payload?: any;
    requestId?: string
  }
  | {
    type: "sketch.snapshot";
    frameId: string;
    payload?: any;
    requestId?: string
  }
  | {
    type: "generation.cancel";
    frameId: string;
    requestId?: string
  }
  | {
    type: "frame.lock.set";
    frameId: string; locked: boolean;
    requestId?: string
  }
  | {
    type: "section.style.update";
    frameId: string;
    sectionId: string;
    style: any;
    requestId?: string
  }

type ServerMessage =
  | { type: "session.ack"; sessionId: string; frameId: string; requestId?: string }
  | { type: "screen.patch"; frameId: string; generatedDoc: AiDocument; requestId?: string }
  | { type: "screen.status"; frameId: string; status: "idle" | "streaming" | "ready" | "error"; requestId?: string }
  | { type: "error"; message: string; requestId?: string }

export function attachRealtimeWSServer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws" })

  wss.on("connection", (ws) => {
    let sessionId: string | null = null
    let frameId: string | null = null

    const send = (msg: ServerMessage) => {
      ws.send(JSON.stringify(msg))
    }
    // COnnection event , menas this triggers the connection of the ws
    ws.on("message", async (data) => {
      let msg: ClientMessage
      try {
        msg = JSON.parse(data.toString())
      } catch {
        send({ type: "error", message: "Invalid JSON message" })
        return
      }

      if (msg.type === "session.start") {
        frameId = msg.frameId
        const session = createSession(frameId)
        sessionId = session.sessionId
        send({
          type: "session.ack",
          sessionId,
          frameId,
          requestId: msg.requestId,
        })
        return
      }

      if (!sessionId || !frameId) {
        send({ type: "error", message: "Session not initialized", requestId: msg.requestId })
        return
      }

      if (msg.type === "sketch.delta") {
        updateSessionSeq(sessionId, Date.now())
        applySessionPatch(sessionId, {
          op: "update",
          target: "document",
          frameId,
          payload: { lastDelta: msg.payload },
          version: Date.now(),
          ts: Date.now(),
        })

        send({ type: "screen.status", frameId, status: "streaming", requestId: msg.requestId })

        try {
          const screens = await GenerateRealTimeAi({
            prompt: msg.payload?.prompt || "Generate SaaS wireframe from sketch",
            imageBase64: msg.payload?.imageBase64,
            density: "airy",
          })

          const generatedDoc: AiDocument = {
            frameId,
            version: Date.now(),
            status: "ready",
            updatedAt: Date.now(),
            sections: screens.map((screen: any) => ({
              id: screen.id,
              frameId,
              name: screen.name,
              elements: (screen.frames || []).map((f: any) => ({
                id: f.id,
                sectionId: screen.id,
                type: f.type || "card",
                role: f.role,
                col: f.col,
                row: f.row,
                span: f.span,
                rowSpan: f.rowSpan,
                text: f.text,
              })),
            })),
          }

          upsertSessionDoc(sessionId, generatedDoc)

          send({
            type: "screen.patch",
            frameId,
            generatedDoc,
            requestId: msg.requestId,
          })
        } catch (e: any) {
          send({ type: "error", message: e?.message || "Generation failed", requestId: msg.requestId })
        }
        return
      }

      if (msg.type === "sketch.snapshot") {
        applySessionPatch(sessionId, {
          op: "update",
          target: "document",
          frameId,
          payload: { snapshot: msg.payload },
          version: Date.now(),
          ts: Date.now(),
        })
        send({ type: "screen.status", frameId, status: "ready", requestId: msg.requestId })
        return
      }

      if (msg.type === "generation.cancel") {
        send({ type: "screen.status", frameId, status: "idle", requestId: msg.requestId })
        return
      }

      if (msg.type === "frame.lock.set") {
        const session = getSession(sessionId)
        if (!session) {
          send({ type: "error", message: "Session not found", requestId: msg.requestId })
          return
        }
        session.locked = msg.locked
        send({ type: "screen.status", frameId, status: "ready", requestId: msg.requestId })
        return
      }

      if (msg.type === "section.style.update") {
        // Placeholder for future style patches over WS.
        send({ type: "screen.status", frameId, status: "ready", requestId: msg.requestId })
        return
      }
    })
  })

  return wss
}