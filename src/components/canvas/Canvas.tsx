import { useState, useRef, useEffect } from "react"

type Shape = {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
}

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shapes, setShapes] = useState<Shape[]>([
    { id: "1", x: 100, y: 100, width: 120, height: 80, rotation: 0, fill: "skyblue" },
    { id: "2", x: 300, y: 200, width: 150, height: 100, rotation: 10, fill: "lightcoral" },
  ])
  const [selected, setSelected] = useState<string | null>(null)
  const [drag, setDrag] = useState<{ offsetX: number; offsetY: number } | null>(null)

  // 🎨 RENDER LOOP
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    shapes.forEach((shape) => {
      ctx.save()
      ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2)
      ctx.rotate((shape.rotation * Math.PI) / 180)
      ctx.fillStyle = shape.fill
      ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)

      if (selected === shape.id) {
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)
      }
      ctx.restore()
    })
  }, [shapes, selected])

  // Mouse helpers
  const getMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouse(e)
    const clicked = shapes.find(
      (s) => x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height
    )
    if (clicked) {
      setSelected(clicked.id)
      setDrag({ offsetX: x - clicked.x, offsetY: y - clicked.y })
    } else {
      setSelected(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drag || !selected) return
    const { x, y } = getMouse(e)
    setShapes((prev) =>
      prev.map((s) =>
        s.id === selected ? { ...s, x: x - drag.offsetX, y: y - drag.offsetY } : s
      )
    )
  }

  const handleMouseUp = () => setDrag(null)

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: "1px solid #ccc", background: "#fafafa" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}

export default CanvasBoard
