"use client"
import React, { useEffect, useRef } from "react"
import  fabric  from "fabric"
import { useCanvasStore } from "../../../lib/store/canvasStore"

const CanvasBoard = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const { activeTool, setCanvasJSON } = useCanvasStore()

  useEffect(() => {
    const canvas = new fabric.Canvas("sketcho-canvas", {
      backgroundColor: "#f8f8f8",
      selection: true,
    })
    canvasRef.current = canvas

    canvas.on("object:modified", () => {
      setCanvasJSON(canvas.toJSON())
    })

    canvas.on("object:added", () => {
      setCanvasJSON(canvas.toJSON())
    })

    return () => {
      canvas.dispose()
    }
  }, [setCanvasJSON])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (activeTool === "Rectangle") {
      const rect = new fabric.Rect({
        width: 100,
        height: 80,
        fill: "#e2e2e2",
        left: 50,
        top: 50,
      })
      canvas.add(rect)
      useCanvasStore.setState({ activeTool: "Select" })
    }

    if (activeTool === "Circle") {
      const circle = new fabric.Circle({
        radius: 40,
        fill: "#e2e2e2",
        left: 120,
        top: 120,
      })
      canvas.add(circle)
      useCanvasStore.setState({ activeTool: "Select" })
    }
  }, [activeTool])



  return (
    <div className="flex-1 w-full h-[calc(100vh-80px)] bg-neutral-100">
      <canvas id="sketcho-canvas" className="w-full h-full" />
    </div>
  )
}

export default CanvasBoard
