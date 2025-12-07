'use client'
import React, { useEffect } from 'react'
import { useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasStore } from '../../../lib/store/canvasStore'

const CanvasRender = ({ theme }: { theme: "light" | "dark" }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = React.useState<any>(null);
  const { setCanvas: setStoreCanvas } = useCanvasStore();

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const initCanvas = new fabric.Canvas(canvasRef.current as HTMLCanvasElement, {
        backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
        selection: true,
      });
      initCanvas.setWidth(window.innerWidth);
      initCanvas.setHeight(window.innerHeight - 120);
      initCanvas.renderAll();
      setCanvas(initCanvas);
      setStoreCanvas(initCanvas as any);

      // Delete key handler
      window.addEventListener("keydown", (e: KeyboardEvent) => {
        const key = e.key;

        if (key === "Delete" || key === "Backspace") {
          const active = initCanvas.getActiveObject();
          if (active) {
            initCanvas.remove(active);
            initCanvas.requestRenderAll();
          }
        }
      });


      return () => {
        initCanvas.dispose();
      }
    }
  }, []);


  // useEffect(() => {
  //   if (!canvas) return;

  //   canvas.setBackgroundColor(
  //     theme === "dark" ? "#1a1a1a" : "#ffffff",
  //     () => canvas.renderAll()
  //   );
  // }, [theme, canvas]);
  return (
    <div>
      <canvas ref={canvasRef} id='canvas' />
    </div>
  )
}

export default CanvasRender;