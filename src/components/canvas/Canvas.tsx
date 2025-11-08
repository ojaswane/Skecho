"use client"
import { useEffect, useRef, useState } from "react"
import { useCanvasStore } from "../../../lib/store/canvasStore"
import { Shape } from "../../../lib/type"

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { shapes, setShapes, addShape, selectedId, setSelectedId, activeTool, setActiveTool } = useCanvasStore()
  const [drag, setDrag] = useState<{ offsetX: number; offsetY: number } | null>(null)

  // 🎨 Render loop
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

      if (selectedId === shape.id) {
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)
      }
      ctx.restore()
    })
  }, [shapes, selectedId])

  // 🖱️ Mouse helpers
  const getMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouse(e)

    // if user clicked "Rectangle", "Circle", etc.
    if (activeTool !== "Select") {
      const newShape: Shape = {
        id: Math.random().toString(36).slice(2),
        type: activeTool,
        x: x - 50,
        y: y - 40,
        width: 100,
        height: 80,
        rotation: 0,
        fill: activeTool === "Circle" ? "lightcoral" : "skyblue",
      }
      addShape(newShape)
      setActiveTool("Select")
      return
    }

    // otherwise handle selection / dragging
    const clicked = shapes.find(
      (s) => x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height
    )
    if (clicked) {
      setSelectedId(clicked.id)
      setDrag({ offsetX: x - clicked.x, offsetY: y - clicked.y })
    } else {
      setSelectedId(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drag || !selectedId) return
    const { x, y } = getMouse(e)
    setShapes(
      shapes.map((s) =>
        s.id === selectedId ? { ...s, x: x - drag.offsetX, y: y - drag.offsetY } : s
      )
    )
  }

  const handleMouseUp = () => setDrag(null)

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={700}
      className="border border-neutral-300 bg-neutral-50 rounded-lg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}

export default CanvasBoard
