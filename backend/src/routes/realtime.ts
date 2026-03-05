import Router from "express"
import type { Request, Response } from "express"
import type { AiDocument, AiPatch } from "../realtime/protocol.js"
import {
  applySessionPatch,
  createSession,
  getSession,
  markSessionUserEdited,
  setSessionLocked,
  updateSessionSeq,
  upsertSessionDoc,
} from "../realtime/sessionStore.js"

const router = Router()

router.post("/session/start", (req: Request, res: Response) => {
  const { frameId, sessionId } = req.body ?? {}
  if (!frameId) {
    return res.status(400).json({ error: "frameId is required" })
  }
  const session = createSession(frameId, sessionId)
  return res.json({
    type: "session.ack",
    sessionId: session.sessionId,
    frameId: session.frameId,
    connectedAt: session.createdAt,
  })
})

router.get("/session/:sessionId", (req: Request, res: Response) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }
  return res.json(session)
})

router.post("/session/:sessionId/seq", (req: Request, res: Response) => {
  const { seq } = req.body ?? {}
  if (typeof seq !== "number") {
    return res.status(400).json({ error: "seq must be a number" })
  }
  const session = updateSessionSeq(req.params.sessionId, seq)
  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }
  return res.json({ ok: true, lastSeq: session.lastSeq })
})

router.post("/session/:sessionId/document", (req: Request, res: Response) => {
  const doc = req.body as AiDocument
  if (!doc?.frameId) {
    return res.status(400).json({ error: "frameId is required in document" })
  }
  const session = upsertSessionDoc(req.params.sessionId, doc)
  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }
  return res.json({ ok: true, version: session.doc.version })
})

router.post("/session/:sessionId/patch", (req: Request, res: Response) => {
  const patch = req.body as AiPatch
  if (!patch?.frameId || !patch?.target || !patch?.op) {
    return res.status(400).json({ error: "Invalid patch payload" })
  }
  const session = applySessionPatch(req.params.sessionId, patch)
  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }
  return res.json({
    ok: true,
    version: session.doc.version,
    updatedAt: session.updatedAt,
  })
})

router.post("/session/:sessionId/lock", (req: Request, res: Response) => {
  const { locked } = req.body ?? {}
  if (typeof locked !== "boolean") {
    return res.status(400).json({ error: "locked must be boolean" })
  }
  const session = setSessionLocked(req.params.sessionId, locked)
  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }
  return res.json({ ok: true, locked: session.locked })
})

router.post("/session/:sessionId/user-edited", (req: Request, res: Response) => {
  const { type, id } = req.body ?? {}
  if (!id || (type !== "section" && type !== "element")) {
    return res.status(400).json({ error: "type must be section|element and id is required" })
  }
  const session = markSessionUserEdited(req.params.sessionId, { type, id })
  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }
  return res.json({ ok: true })
})

export default router
