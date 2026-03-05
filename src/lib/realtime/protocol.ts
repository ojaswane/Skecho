export type RealtimeFrameStatus = "idle" | "streaming" | "error" | "ready"

export type AiTheme = "minimal" | "bold" | "soft" | "wireframe"

export type AiSectionStyle = {
  theme?: AiTheme
  radius?: number
  spacing?: number
  fontScale?: number
  colorScheme?: string
}

export type AiElement = {
  id: string
  sectionId: string
  type: "card" | "text" | "button" | "input" | "image" | "block"
  role?: string
  col?: number
  row?: number
  span?: number
  rowSpan?: number
  text?: string
  locked?: boolean
  style?: Record<string, unknown>
}

export type AiSection = {
  id: string
  frameId: string
  name?: string
  style?: AiSectionStyle
  elements: AiElement[]
}

export type AiDocument = {
  frameId: string
  version: number
  status: RealtimeFrameStatus
  sections: AiSection[]
  updatedAt: number
}

export type AiPatchOp = "add" | "update" | "remove"
export type AiPatchTarget = "document" | "section" | "element"

export type AiPatch = {
  op: AiPatchOp
  target: AiPatchTarget
  frameId: string
  id?: string
  sectionId?: string
  payload?: Record<string, unknown>
  version: number
  ts: number
}

export type UserEditTarget =
  | { type: "section"; id: string }
  | { type: "element"; id: string }

export type ClientRealtimeMessage =
  | {
      type: "session.start"
      sessionId: string
      frameId: string
      prompt?: string
      ts: number
    }
  | {
      type: "sketch.delta"
      sessionId: string
      frameId: string
      seq: number
      delta: Record<string, unknown>
      ts: number
    }
  | {
      type: "sketch.snapshot"
      sessionId: string
      frameId: string
      snapshot: Record<string, unknown>
      ts: number
    }
  | {
      type: "generation.cancel"
      sessionId: string
      frameId: string
      reason?: string
      ts: number
    }
  | {
      type: "section.style.update"
      sessionId: string
      frameId: string
      sectionId: string
      style: AiSectionStyle
      ts: number
    }
  | {
      type: "frame.lock.set"
      sessionId: string
      frameId: string
      locked: boolean
      ts: number
    }

export type ServerRealtimeMessage =
  | {
      type: "session.ack"
      sessionId: string
      frameId: string
      connectedAt: number
    }
  | {
      type: "plan.patch"
      patch: AiPatch
    }
  | {
      type: "screen.patch"
      patch: AiPatch
    }
  | {
      type: "screen.status"
      frameId: string
      status: RealtimeFrameStatus
      version: number
      ts: number
    }
  | {
      type: "error"
      code: string
      message: string
      frameId?: string
      ts: number
    }
