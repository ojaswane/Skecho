type Project = {
  id: string
  user_id: string
  name: string
  description?: string
  created_at?: string
}

// type of the shapes used in canvas
type shape = {
  id: string,
  x: number,
  y: number,
  fill: string,
  width: number,
  height: number,
  type: string
}