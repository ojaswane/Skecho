type Project = {
  id: string
  user_id: string
  name: string
  description?: string
  created_at?: string
}

// type of the shapes used in canvas

// export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text' | 'arrow' | 'oval' | 'triangle'

export type Shape = {
  id: string,
  x: number,
  y: number,
  fill: string,
  width: number,
  height: number,
  type: string,
  rotation: number
}

export type AIScreen = {
  id: string
  name: string
  frameId: string
  elements: {
    id: string
    type: string
    role?: string
    col: number
    row: number
    span: number
    rowSpan: number
  }[]
}
