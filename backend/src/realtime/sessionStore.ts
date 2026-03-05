import { randomUUID } from "crypto"
import type { AiDocument, AiPatch } from "./protocol.js"

type SessionState = {
  sessionId: string
  frameId: string
  createdAt: number
  updatedAt: number
  lastSeq: number
  locked: boolean
  doc: AiDocument
  userEditedSections: Record<string, true>
  userEditedElements: Record<string, true>
}

const sessions = new Map<string, SessionState>()

const now = () => Date.now()

const emptyDoc = (frameId: string): AiDocument => ({
  frameId,
  version: 0,
  status: "idle",
  sections: [],
  updatedAt: now(),
})

function applyPatch(doc: AiDocument, patch: AiPatch): AiDocument {
  const next: AiDocument = {
    ...doc,
    version: Math.max(doc.version, patch.version),
    updatedAt: patch.ts,
  }

  if (patch.target === "document") {
    return { ...next, ...(patch.payload ?? {}) } as AiDocument
  }

  if (patch.target === "section") {
    if (!patch.id) return next
    if (patch.op === "remove") {
      next.sections = next.sections.filter((s) => s.id !== patch.id)
      return next
    }
    const idx = next.sections.findIndex((s) => s.id === patch.id)
    if (idx === -1 && patch.op === "add" && patch.payload) {
      next.sections = [...next.sections, patch.payload as unknown as AiDocument["sections"][number]]
      return next
    }
    if (idx >= 0 && patch.payload) {
      next.sections = next.sections.map((s, i) =>
        i === idx ? ({ ...s, ...patch.payload } as typeof s) : s
      )
    }
    return next
  }

  if (patch.target === "element") {
    if (!patch.sectionId || !patch.id) return next
    next.sections = next.sections.map((section) => {
      if (section.id !== patch.sectionId) return section
      if (patch.op === "remove") {
        return {
          ...section,
          elements: section.elements.filter((e) => e.id !== patch.id),
        }
      }
      const idx = section.elements.findIndex((e) => e.id === patch.id)
      if (idx === -1 && patch.op === "add" && patch.payload) {
        return {
          ...section,
          elements: [
            ...section.elements,
            patch.payload as unknown as (typeof section.elements)[number],
          ],
        }
      }
      if (idx >= 0 && patch.payload) {
        return {
          ...section,
          elements: section.elements.map((el, i) =>
            i === idx ? ({ ...el, ...patch.payload } as typeof el) : el
          ),
        }
      }
      return section
    })
  }

  return next
}

export function createSession(frameId: string, sessionId?: string): SessionState {
  const id = sessionId ?? randomUUID()
  const state: SessionState = {
    sessionId: id,
    frameId,
    createdAt: now(),
    updatedAt: now(),
    lastSeq: 0,
    locked: true,
    doc: emptyDoc(frameId),
    userEditedSections: {},
    userEditedElements: {},
  }
  sessions.set(id, state)
  return state
}

export function getSession(sessionId: string): SessionState | null {
  return sessions.get(sessionId) ?? null
}

export function updateSessionSeq(sessionId: string, seq: number): SessionState | null {
  const state = sessions.get(sessionId)
  if (!state) return null
  state.lastSeq = Math.max(state.lastSeq, seq)
  state.updatedAt = now()
  return state
}

export function setSessionLocked(sessionId: string, locked: boolean): SessionState | null {
  const state = sessions.get(sessionId)
  if (!state) return null
  state.locked = locked
  state.updatedAt = now()
  return state
}

export function upsertSessionDoc(sessionId: string, doc: AiDocument): SessionState | null {
  const state = sessions.get(sessionId)
  if (!state) return null
  state.doc = doc
  state.updatedAt = now()
  return state
}

export function applySessionPatch(sessionId: string, patch: AiPatch): SessionState | null {
  const state = sessions.get(sessionId)
  if (!state) return null
  const isUserEditedElement = Boolean(patch.id && state.userEditedElements[patch.id])
  const isUserEditedSection = Boolean(
    (patch.sectionId && state.userEditedSections[patch.sectionId]) ||
      (patch.id && state.userEditedSections[patch.id])
  )
  if (isUserEditedElement || isUserEditedSection) {
    return state
  }
  state.doc = applyPatch(state.doc, patch)
  state.updatedAt = now()
  return state
}

export function markSessionUserEdited(
  sessionId: string,
  target: { type: "section" | "element"; id: string }
): SessionState | null {
  const state = sessions.get(sessionId)
  if (!state) return null
  if (target.type === "section") state.userEditedSections[target.id] = true
  if (target.type === "element") state.userEditedElements[target.id] = true
  state.updatedAt = now()
  return state
}
