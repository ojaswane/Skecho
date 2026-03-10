// Canonical frame lifecycle status used by realtime generation.
export type RealtimeFrameStatus = "idle" | "streaming" | "error" | "ready"

export type AiTheme = "minimal" | "bold" | "soft" | "wireframe"

// Section-level style controls that can be patched independently.
export type AiSectionStyle = {
  theme?: AiTheme
  radius?: number
  spacing?: number
  fontScale?: number
  colorScheme?: string
}

// A single renderable item inside a section.
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

// Logical grouping of elements that can be styled and edited as a unit.
export type AiSection = {
  id: string
  frameId: string
  name?: string
  style?: AiSectionStyle
  elements: AiElement[]
}

// Source-of-truth AI document for one target frame.
export type AiDocument = {
  frameId: string
  version: number
  status: RealtimeFrameStatus
  sections: AiSection[]
  updatedAt: number
}

export type AiPatchOp = "add" | "update" | "remove"
export type AiPatchTarget = "document" | "section" | "element"

// Incremental operation applied to a document/section/element.
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

// Messages client sends to backend over realtime transport.
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

// Messages backend sends back to client.
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
