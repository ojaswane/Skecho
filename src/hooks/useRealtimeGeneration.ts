'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { AiPatch, AiSectionStyle } from "../../lib/realtime/protocol"

type RealtimeState = "idle" | "connecting" | "ready" | "error"

type UseRealtimeGenerationParams = {
  frameId: string
  enabled?: boolean
  baseUrl?: string
}

type JsonLike = Record<string, unknown>

export function useRealtimeGeneration({
  frameId,
  enabled = true,
  baseUrl = process.env.NEXT_PUBLIC_REALTIME_BASE_URL ?? "http://localhost:3001",
}: UseRealtimeGenerationParams) {

  // Session + hook-level status for UI feedback and retry flows.
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [state, setState] = useState<RealtimeState>("idle")
  const [error, setError] = useState<string | null>(null)

  // Local sequence/version cursors to maintain ordered updates.
  const seqRef = useRef(0)
  const versionRef = useRef(0)
  const mountedRef = useRef(true)

  const realtimeBase = useMemo(() => `${baseUrl.replace(/\/$/, "")}/realtime`, [baseUrl])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Boots a backend realtime session for the current frame. what usCallBack will dO is that it will REMEMBER the fucntion itself to prevent itself for rerendering fo no reason

  const startSession = useCallback(async () => {
    if (!enabled || !frameId) return null
    setState("connecting")
    setError(null)
    try {

      const res = await fetch(`${realtimeBase}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameId }),
      })

      if (!res.ok) {
        throw new Error(`session.start failed (${res.status})`)
      }
      const data = (await res.json()) as { sessionId?: string }

      if (!data.sessionId) {
        throw new Error("session.start returned no sessionId")
      }

      if (!mountedRef.current) return null
      setSessionId(data.sessionId)
      setState("ready")
      return data.sessionId

    } catch (e) {
      if (!mountedRef.current) return null
      setState("error")
      setError(e instanceof Error ? e.message : "Unknown realtime start error")
      return null
    }
  }, [enabled, frameId, realtimeBase])

  // Ensures a session exists before performing API actions.
  const withSession = useCallback(
    async <T,>(fn: (sid: string) => Promise<T>): Promise<T | null> => {
      const sid = sessionId ?? (await startSession())
      if (!sid) return null
      try {
        return await fn(sid)
      } catch (e) {
        if (mountedRef.current) {
          setState("error")
          setError(e instanceof Error ? e.message : "Unknown realtime error")
        }
        return null
      }
    },
    [sessionId, startSession]
  )

  // Registers monotonic sequence on backend to preserve ordering.
  const sendSeq = useCallback(
    async (sid: string) => {
      const nextSeq = ++seqRef.current
      await fetch(`${realtimeBase}/session/${sid}/seq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seq: nextSeq }),
      })
      return nextSeq
    },
    [realtimeBase]
  )

  // Sends an explicit patch payload (document/section/element).
  const sendPatch = useCallback(

    async (patch: AiPatch) =>

      withSession(async (sid) => {

        const res = await fetch(`${realtimeBase}/session/${sid}/patch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        })

        if (!res.ok) throw new Error(`patch failed (${res.status})`)
        versionRef.current = Math.max(versionRef.current, patch.version)
        return true

      }),
    [realtimeBase, withSession]
  )

  // Lightweight delta update used for high-frequency sketch changes.
  const sendDelta = useCallback(
    async (delta: JsonLike) =>
      withSession(async (sid) => {
        const seq = await sendSeq(sid)
        const res = await fetch(`${realtimeBase}/session/${sid}/patch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            op: "update",
            target: "document",
            frameId,
            payload: { lastDelta: delta, seq },
            version: versionRef.current + 1,
            ts: Date.now(),
          } satisfies AiPatch),
        })
        if (!res.ok) throw new Error(`delta failed (${res.status})`)
        versionRef.current += 1
        return true
      }),
    [frameId, realtimeBase, sendSeq, withSession]
  )

  // Full snapshot sync fallback used for periodic reconciliation.
  const sendSnapshot = useCallback(

    async (snapshot: JsonLike) =>

      withSession(async (sid) => {

        const seq = await sendSeq(sid)
        const res = await fetch(`${realtimeBase}/session/${sid}/document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frameId,
            version: versionRef.current + 1,
            status: "streaming",
            sections: [],
            updatedAt: Date.now(),
            snapshot,
            seq,
          }),
        })

        if (!res.ok) throw new Error(`snapshot failed (${res.status})`)
        versionRef.current += 1

        return true
      }),
    [frameId, realtimeBase, sendSeq, withSession]
  )

  // Marks generation as cancelled for current frame session.
  const cancelGeneration = useCallback(
    async (reason?: string) =>
      withSession(async (sid) => {

        const patch: AiPatch = {
          op: "update",
          target: "document",
          frameId,
          payload: { cancelled: true, reason: reason ?? "user", status: "idle" },
          version: versionRef.current + 1,
          ts: Date.now(),
        }

        return sendPatch(patch)

      }),
    [frameId, sendPatch, withSession]
  )

  // Updates lock state for the current frame session.
  const setFrameLock = useCallback(
    async (locked: boolean) =>

      withSession(async (sid) => {

        const res = await fetch(`${realtimeBase}/session/${sid}/lock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locked }),
        })

        if (!res.ok) throw new Error(`lock failed (${res.status})`)
        return true
      }),
    [realtimeBase, withSession]
  )

  // Applies style patch for a specific section.
  const updateSectionStyle = useCallback(

    async (sectionId: string, style: AiSectionStyle) =>
      withSession(async (_sid) => {

        const patch: AiPatch = {
          op: "update",
          target: "section",
          frameId,
          id: sectionId,
          payload: { style },
          version: versionRef.current + 1,
          ts: Date.now(),
        }
        return sendPatch(patch)

      }),
    [frameId, sendPatch, withSession]
  )

  // Auto-start session when hook becomes active.
  useEffect(() => {
    if (!enabled || !frameId) return
    void startSession()
  }, [enabled, frameId, startSession])

  return {
    state,
    error,
    sessionId,
    seqRef,
    versionRef,
    startSession,
    sendDelta,
    sendSnapshot,
    cancelGeneration,
    setFrameLock,
    updateSectionStyle,
    sendPatch,
  }
}
