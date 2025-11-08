"use client"
import { useEffect, useRef } from "react"
import { fabric } from "fabric"
import { useCanvasStore } from "../../../lib/store/canvasStore"

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activeTool, setCanvas, setCanvasJSON, selectedFrame } = useCanvasStore()

  useEffect(() => {
    const canvas = new fabric.Canvas("sketcho-canvas", {
      backgroundColor: "#f8f8f8",
      selection: true,
    })
    setCanvas(canvas)

    // update zustand store when objects change
    const updateJSON = () => setCanvasJSON(canvas.toJSON())
    canvas.on("object:modified", updateJSON)
    canvas.on("object:added", updateJSON)
    canvas.on("object:removed", updateJSON)

    // handle frame (desktop, mobile, etc.)
    if (selectedFrame) {
      const frameSizes = {
        desktop: { width: 1440, height: 1024 },
        tablet: { width: 768, height: 1024 },
        mobile: { width: 375, height: 812 },
      }
      const { width, height } = frameSizes[selectedFrame] || frameSizes.desktop

      const frame = new fabric.Rect({
        width,
        height,
        stroke: "#aaa",
        fill: "#fff",
        left: 100,
        top: 100,
        selectable: false,
      })
      canvas.add(frame)
      canvas.sendToBack(frame)
    }

    return () => canvas.dispose()
  }, [selectedFrame, setCanvas, setCanvasJSON])

  // handle tool changes
  useEffect(() => {
    const canvas = useCanvasStore.getState().canvas
    if (!canvas) return

    if (activeTool === "Rectangle") {
      const rect = new fabric.Rect({
        width: 100,
        height: 80,
        fill: "#d1d5db",
        left: 100,
        top: 100,
      })
      canvas.add(rect)
      useCanvasStore.setState({ activeTool: "Select" })
    }

    if (activeTool === "Circle") {
      const circle = new fabric.Circle({
        radius: 50,
        fill: "#d1d5db",
        left: 200,
        top: 200,
      })
      canvas.add(circle)
      useCanvasStore.setState({ activeTool: "Select" })
    }
  }, [activeTool])

  return (
    <div className="w-full h-[calc(100vh-80px)] flex justify-center items-center">
      <canvas id="sketcho-canvas" width={1600} height={1000} />
    </div>
  )
}

export default CanvasBoard
