// thisis the protocol definition for the realtime AI generation feature. It defines the data structures and types used for communication between the frontend and backend during the AI generation process.
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

// Layout tree node (row/column auto-layout)
export type AiLayoutNode = {
  id?: string
  type: "row" | "column" | "element"
  gap?: number
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "space-between"
  // Only present for type="element"
  elementId?: string
  children?: AiLayoutNode[]
}

// A single renderable item inside a section.
export type AiElement = {
  id: string
  sectionId: string
  type: "card" | "text" | "button" | "input" | "image" | "block"
  // Optional semantic hint used by the frontend renderer.
  // This avoids guessing semantics from element ids or roles.
  semantic?:
    | "nav"
    | "sidebar"
    | "footer"
    | "hero_text"
    | "media"
    | "cta"
    | "feature_grid"
    | "testimonial"
    | "pricing"
    | "faq"
    | "widget_timer"
    | "widget_chart"
    | "widget_calendar"
    | "widget_tasks"
    | "card"
    | "unknown"
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
  layoutTree?: AiLayoutNode
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
