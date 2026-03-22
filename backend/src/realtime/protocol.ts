// Canonical frame lifecycle status used by realtime generation.
export type RealtimeFrameStatus = "idle" | "streaming" | "error" | "ready"

// Section-level style controls that can be patched independently.
export type AiSectionStyle = {
  theme?: "minimal" | "bold" | "soft" | "wireframe"
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
  // Optional semantic hint used by the frontend renderer.
  // This avoids guessing semantics from element ids or roles.
  semantic?: "nav" | "hero_text" | "media" | "cta" | "card" | "unknown"
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

// Incremental operation applied to a document/section/element.
export type AiPatch = {
  op: "add" | "update" | "remove"
  target: "document" | "section" | "element"
  frameId: string
  id?: string
  sectionId?: string
  payload?: Record<string, unknown>
  version: number
  ts: number
}
