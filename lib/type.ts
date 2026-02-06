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

export interface AIScreen {
  id: string;
  name: string;
  frameId: string;
  elements: {
    id: string;
    role?: string;
    col: number;
    row: number;
    span: number;
    rowSpan: number;
    blocks: {
      id: string;
      kind: "body_text" | "profile_image" | "content_image" | "title_text" | "meta_text" | "primary_action";
    }[];
  }[];
}