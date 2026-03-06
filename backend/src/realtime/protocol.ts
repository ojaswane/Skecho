export type RealtimeFrameStatus = "idle" | "streaming" | "error" | "ready"

export type AiSectionStyle = {
  theme?: "minimal" | "bold" | "soft" | "wireframe"
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
  id: string | string[]
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
