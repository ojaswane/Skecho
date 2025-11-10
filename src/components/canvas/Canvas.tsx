"use client"
import { useEffect, useRef } from "react"
import { Fabric } from "fabric"
import { useCanvasStore } from "../../../lib/store/canvasStore"

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activeTool, theme, setCanvas, setCanvasJSON, selectedFrame } = useCanvasStore()

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const canvas = new Fabric.Canvas(canvasEl, {
      backgroundColor: theme === "dark" ? "#0f0f0f" : "#f8f8f8",
      selection: true,
    })

    // Enable pan and zoom
    let isDragging = false
    let lastPosX = 0
    let lastPosY = 0

    canvas.on("mouse:down", (opt) => {
      const evt = opt.e as MouseEvent
      if (evt.altKey || evt.button === 1) {
        isDragging = true
        canvas.selection = false
        lastPosX = evt.clientX
        lastPosY = evt.clientY
      }
    })

    canvas.on("mouse:move", (opt) => {
      if (isDragging) {
        const e = opt.e as MouseEvent
        const vpt = canvas.viewportTransform!
        vpt[4] += e.clientX - lastPosX
        vpt[5] += e.clientY - lastPosY
        canvas.requestRenderAll()
        lastPosX = e.clientX
        lastPosY = e.clientY
      }
    })

    canvas.on("mouse:up", () => {
      isDragging = false
      canvas.selection = true
    })

    canvas.on("mouse:wheel", (opt) => {
      const delta = (opt.e as WheelEvent).deltaY
      let zoom = canvas.getZoom()
      zoom *= 0.999 ** delta
      zoom = Math.min(Math.max(zoom, 0.5), 3)
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    // Save canvas instance in Zustand
    setCanvas(canvas)

    // Keep Zustand JSON updated
    const updateJSON = () => setCanvasJSON(canvas.toJSON())
    canvas.on("object:modified", updateJSON)
    canvas.on("object:added", updateJSON)
    canvas.on("object:removed", updateJSON)

    // Draw frame if selected
    if (selectedFrame) {
      const sizes = {
        desktop: { width: 1440, height: 1024 },
        tablet: { width: 768, height: 1024 },
        mobile: { width: 375, height: 812 },
      }
      const { width, height } = sizes[(selectedFrame as keyof typeof sizes)] || sizes.desktop
      const frame = new Fabric.Rect({
        width,
        height,
        left: 100,
        top: 100,
        fill: theme === "dark" ? "#1a1a1a" : "#fff",
        stroke: theme === "dark" ? "#444" : "#ccc",
        strokeWidth: 1,
        selectable: true,
        hasControls: true,
      })
      canvas.add(frame)
      canvas.setActiveObject(frame)
    }

    return () => canvas.dispose()
  }, [theme, selectedFrame, setCanvas, setCanvasJSON])

  // Handle tool actions (rect, circle, etc.)
  useEffect(() => {
    const canvas = useCanvasStore.getState().canvas
    if (!canvas) return

    if (activeTool === "Rectangle") {
      const rect = new Fabric.Rect({
        width: 150,
        height: 100,
        left: 200,
        top: 200,
        fill: "#d1d5db",
      })
      canvas.add(rect)
      useCanvasStore.setState({ activeTool: "Select" })
    }

    if (activeTool === "Circle") {
      const circle = new Fabric.Circle({
        radius: 60,
        left: 300,
        top: 300,
        fill: "#d1d5db",
      })
      canvas.add(circle)
      useCanvasStore.setState({ activeTool: "Select" })
    }
  }, [activeTool])

  return (
    <div
      className={`w-full h-[calc(100vh-80px)] flex justify-center items-center ${theme === "dark" ? "bg-[#0f0f0f]" : "bg-[#f8f8f8]"
        }`}
    >
      <canvas
        ref={canvasRef}
        id="sketcho-canvas"
        width={1600}
        height={1000}
        className="rounded-2xl shadow-sm"
      />
    </div>
  )
}

export default CanvasBoard