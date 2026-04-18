import Router from "express"
import type { Request, Response } from "express"
import type { AiDocument, AiPatch } from "../realtime/protocol.js"
import { GenerateRealTimeAi } from "../Ai/RealTime_Ai.js"
import {
  applySessionPatch,
  createSession,
  getSession,
  markSessionUserEdited,
  setSessionLocked,
  updateSessionSeq,
  upsertSessionDoc,
} from "../realtime/sessionStore.js"
import { normalizeGeneratedScreensToSections } from "../utils/normalizeGeneratedScreen.js"

// Phase 1 realtime HTTP control routes for session/document/patch state.
const router = Router()

/*
  Utility: Normalizes the sessionId from request parameters.
  Handles cases where the param might be an array or undefined.
*/

const getSessionId = (req: Request): string | null => {
  const raw = req.params.sessionId
  if (Array.isArray(raw)) return raw[0] ?? null
  return raw ?? null
}

/**
  Initializes a new AI generation session.
  This establishes the "band" (context) for a specific frame,
  allowing subsequent sequential requests to be grouped together.
*/
router.post("/session/start", (req: Request, res: Response) => {
  const { frameId, sessionId } = req.body ?? {}

  if (!frameId) {
    return res.status(400).json({ error: "frameId is required" })
  }

  // Creates a record in the sessionStore to track AI progress for this frame
  const session = createSession(frameId, sessionId)

  return res.json({
    type: "session.ack",
    sessionId: session.sessionId,
    frameId: session.frameId,
    connectedAt: session.createdAt,
  })

})

/*
 Retrieves the current state of a specific session.
 Used by the client to sync or resume work on a specific AI-generated frame.
*/

router.get("/session/:sessionId", (req: Request, res: Response) => {
  const sessionId = getSessionId(req)

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" })
  }

  const session = getSession(sessionId)

  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }

  return res.json(session)
})

/*
  Updates the 'Sequence Number' (lastSeq) for the session.
  Used to ensure that streaming updates or multiple parts of a generation 
  are processed in the correct order.
*/
router.post("/session/:sessionId/seq", (req: Request, res: Response) => {
  const sessionId = getSessionId(req)

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" })
  }

  const { seq } = req.body ?? {}

  if (typeof seq !== "number") {
    return res.status(400).json({ error: "seq must be a number" })
  }

  const session = updateSessionSeq(sessionId, seq)

  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }

  return res.json({ ok: true, lastSeq: session.lastSeq })
})


/*
  Performs an 'Upsert' (Update or Insert) of the full AI Document.
  Typically used when the AI has finished a major generation phase
  and needs to save the entire state of the frame (elements, roles, etc.).
*/

router.post("/session/:sessionId/document", (req: Request, res: Response) => {

  const sessionId = getSessionId(req)

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" })
  }

  const doc = req.body as AiDocument

  if (!doc?.frameId) {
    return res.status(400).json({ error: "frameId is required in document" })
  }

  const session = upsertSessionDoc(sessionId, doc)

  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }

  return res.json({ ok: true, version: session.doc.version })
})


/*
  Applies a partial update (patch) to the session document.
  Instead of sending the whole document, this sends specific operations (op)
  to change small parts of the UI, improving performance during realtime updates.
*/

router.post("/session/:sessionId/patch", async (req: Request, res: Response) => {
  const sessionId = getSessionId(req)

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" })
  }

  const patch = req.body as AiPatch

  if (!patch?.frameId || !patch?.target || !patch?.op) {
    return res.status(400).json({ error: "Invalid patch payload" })
  }

  const session = applySessionPatch(sessionId, patch)

  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }

  let generatedDoc: AiDocument | null = null

  // Step 2 bridge: for high-frequency document updates, generate a realtime doc.
  if (patch.target === "document" && patch.op === "update") {
    try {
      const payload = (patch.payload ?? {}) as any

      // this is how in realtime we are calling the AIff
      const screens = await GenerateRealTimeAi({
        prompt: payload?.lastDelta?.prompt || payload?.prompt || "Generate SaaS wireframe from sketch",
        imageBase64: payload?.imageBase64,
        density: "airy",
      })

      generatedDoc = {
        frameId: patch.frameId,
        version: session.doc.version + 1,
        status: "ready",
        updatedAt: Date.now(),
        sections: normalizeGeneratedScreensToSections(screens as any[], patch.frameId),
      }

      upsertSessionDoc(sessionId, generatedDoc)
    } catch (e: any) {
      return res.json({
        ok: true,
        version: session.doc.version,
        updatedAt: session.updatedAt,
        generationError: e?.message || "PREVIEW_GENERATION_FAILED",
      })
    }
  }

  return res.json({
    ok: true,
    version: generatedDoc?.version ?? session.doc.version,
    updatedAt: generatedDoc?.updatedAt ?? session.updatedAt,
    generatedDoc,
  })
})


/*
  Locks or unlocks the session.
  When locked, the AI might be prevented from making further changes,
  or the UI might be "frozen" for the user while the AI is processing.
*/

router.post("/session/:sessionId/lock", (req: Request, res: Response) => {
  const sessionId = getSessionId(req)

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" })
  }

  const { locked } = req.body ?? {}

  if (typeof locked !== "boolean") {
    return res.status(400).json({ error: "locked must be boolean" })
  }

  const session = setSessionLocked(sessionId, locked)

  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }

  return res.json({ ok: true, locked: session.locked })
})


/*
  Marks specific parts of the session (sections or elements) as "user-modified".
  This is crucial for AI logic to know which parts of the layout the user
  has touched so it doesn't accidentally overwrite them in future generations.
*/

router.post("/session/:sessionId/user-edited", (req: Request, res: Response) => {
  const sessionId = getSessionId(req)

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" })
  }

  const { type, id } = req.body ?? {}

  if (!id || (type !== "section" && type !== "element")) {
    return res.status(400).json({ error: "type must be section|element and id is required" })
  }

  const session = markSessionUserEdited(sessionId, { type, id })

  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }

  return res.json({ ok: true })
})

export default router
