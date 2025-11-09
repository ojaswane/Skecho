"use client"
import { useEffect, useRef, useState } from "react"
import { useCanvasStore } from "../../../lib/store/canvasStore"

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activeTool, setCanvas, setCanvasJSON, selectedFrame } = useCanvasStore()
  const [fabricLib, setFabricLib] = useState<any>(null)

  useEffect(() => {
    // Dynamically import fabric only on the client
    import("fabric").then((mod) => {
      const fabric = mod.default
      setFabricLib(fabric)
    })
  }, [])

  useEffect(() => {
    if (!fabricLib) return
    const fabric = fabricLib

    const canvas = new fabric.Canvas("sketcho-canvas", {
      backgroundColor: "#f8f8f8",
      selection: true,
    })
    setCanvas(canvas)

    const updateJSON = () => setCanvasJSON(canvas.toJSON())
    canvas.on("object:modified", updateJSON)
    canvas.on("object:added", updateJSON)
    canvas.on("object:removed", updateJSON)

    if (selectedFrame) {
      const frameSizes: any = {
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

    return () => {
      canvas.dispose()
    }
  }, [fabricLib, selectedFrame, setCanvas, setCanvasJSON])

  useEffect(() => {
    if (!fabricLib) return
    const canvas = useCanvasStore.getState().canvas
    if (!canvas) return

    const fabric = fabricLib

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
  }, [activeTool, fabricLib])

  return (
    <div className="w-full h-[calc(100vh-80px)] flex justify-center items-center">
      <canvas id="sketcho-canvas" width={1600} height={1000} ref={canvasRef} />
    </div>
  )
}

export default CanvasBoard
