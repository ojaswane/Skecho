'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { AiPatch, AiSectionStyle } from "../../lib/realtime/protocol"

type RealtimeState = "idle" | "connecting" | "ready" | "error"

type UseRealtimeGenerationParams = {
  frameId: string
  enabled?: boolean
  baseUrl?: string
  wsUrl?: string
}

type JsonLike = Record<string, unknown>
type RealtimePatchResponse = {
  ok: boolean
  version: number
  updatedAt: number
  generatedDoc?: Record<string, unknown> | null
  generationError?: string
}

export function useRealtimeGeneration({
  frameId,
  enabled = true,
  baseUrl = process.env.NEXT_PUBLIC_REALTIME_BASE_URL ?? "http://localhost:3001",
  wsUrl = process.env.NEXT_PUBLIC_REALTIME_WS_URL ?? "ws://localhost:3001/ws",
}: UseRealtimeGenerationParams) {

  // Session + hook-level status for UI feedback and retry flows.
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [state, setState] = useState<RealtimeState>("idle")
  const [error, setError] = useState<string | null>(null)

  // Local sequence/version cursors to maintain ordered updates.
  const seqRef = useRef(0) // this is for knowing the order of updation
  const versionRef = useRef(0) // This helps to keep the track of latest patch version
  const mountedRef = useRef(true) // component is alive or gone

  const realtimeBase = useMemo(() => `${baseUrl.replace(/\/$/, "")}/realtime`, [baseUrl]) // ts removes some extra slases or getting a better result
  // this realtimeBase is basically memorises only one time without rerendering anything unless there are some more changes
  // Only do that string cleaning and adding stuff if the baseUrl actually changes. => why use memo
  

  
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // WebSocket connection (preferred for realtime transport).
  const socketRef = useRef<WebSocket | null>(null)
  const pendingRef = useRef(new Map<string, (data: RealtimePatchResponse) => void>())

  // Boots a backend realtime session for the current frame. what usCallBack will dO is that it will REMEMBER the fucntion itself to prevent itself for rerendering fo no reason

  const startSession = useCallback(async () => {
    if (!enabled || !frameId) return null
    setState("connecting")
    setError(null)
    try {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        const ws = new WebSocket(wsUrl)
        socketRef.current = ws
        await new Promise<void>((resolve, reject) => {
          ws.onopen = () => resolve()
          ws.onerror = () => reject(new Error("WebSocket connection failed"))
        })
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            if (msg?.type === "session.ack" && msg.sessionId) {
              if (mountedRef.current) {
                setSessionId(msg.sessionId)
                setState("ready")
              }
            }
            if (msg?.requestId && pendingRef.current.has(msg.requestId)) {
              const resolve = pendingRef.current.get(msg.requestId)!
              pendingRef.current.delete(msg.requestId)
              resolve(msg as RealtimePatchResponse)
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      // Initiate session start over WS
      const requestId = `${Date.now()}-${Math.random()}`
      const sessionPromise = new Promise<RealtimePatchResponse>((resolve) => {
        pendingRef.current.set(requestId, resolve)
      })
      socketRef.current?.send(JSON.stringify({ type: "session.start", frameId, requestId }))
      const ack = await sessionPromise
      if (!mountedRef.current) return null
      if (ack && (ack as any).sessionId) {
        setSessionId((ack as any).sessionId)
      }
      setState("ready")
      return (ack as any).sessionId ?? null

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
        const requestId = `${Date.now()}-${Math.random()}`
        const ws = socketRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket not connected")
        }
        const payload = { ...patch, requestId }
        ws.send(JSON.stringify({ type: "patch", ...payload }))
        return await new Promise<RealtimePatchResponse>((resolve) => {
          pendingRef.current.set(requestId, resolve)
        })

      }),
    [realtimeBase, withSession]
  )

  // Lightweight delta update used for high-frequency sketch changes.
  const sendDelta = useCallback(
    async (delta: JsonLike) =>
      withSession(async (sid) => {
        const requestId = `${Date.now()}-${Math.random()}`
        const ws = socketRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket not connected")
        }
        ws.send(
          JSON.stringify({
            type: "sketch.delta",
            frameId,
            payload: delta,
            requestId,
          })
        )
        return await new Promise<RealtimePatchResponse>((resolve) => {
          pendingRef.current.set(requestId, resolve)
        })
      }),
    [frameId, realtimeBase, sendSeq, withSession]
  )

  // Full snapshot sync fallback used for periodic reconciliation.
  const sendSnapshot = useCallback(

    async (snapshot: JsonLike) =>

      withSession(async (sid) => {
        const requestId = `${Date.now()}-${Math.random()}`
        const ws = socketRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket not connected")
        }
        ws.send(
          JSON.stringify({
            type: "sketch.snapshot",
            frameId,
            payload: snapshot,
            requestId,
          })
        )
        return true
      }),
    [frameId, realtimeBase, sendSeq, withSession]
  )

  // Marks generation as cancelled for current frame session.
  const cancelGeneration = useCallback(
    async (reason?: string) =>
      withSession(async (sid) => {
        const ws = socketRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket not connected")
        }
        ws.send(
          JSON.stringify({
            type: "generation.cancel",
            frameId,
            payload: { reason: reason ?? "user" },
          })
        )
        return true

      }),
    [frameId, sendPatch, withSession]
  )

  // Updates lock state for the current frame session.
  const setFrameLock = useCallback(
    async (locked: boolean) =>

      withSession(async (sid) => {
        const ws = socketRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket not connected")
        }
        ws.send(
          JSON.stringify({
            type: "frame.lock.set",
            frameId,
            locked,
          })
        )
        return true
      }),
    [realtimeBase, withSession]
  )

  // Applies style patch for a specific section.
  const updateSectionStyle = useCallback(

    async (sectionId: string, style: AiSectionStyle) =>
      withSession(async (_sid) => {
        const ws = socketRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket not connected")
        }
        ws.send(
          JSON.stringify({
            type: "section.style.update",
            frameId,
            sectionId,
            style,
          })
        )
        return true

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
