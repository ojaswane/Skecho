'use client'
import React, { useEffect } from 'react'
import { useRef } from 'react';
import { Canvas } from 'fabric';
const CanvasRender = ({ theme }: { theme: "light" | "dark" }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = React.useState<any>(null);
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
      });
      initCanvas.renderAll();
      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      }
    }
  }, []);


  useEffect(() => {
    if (!canvas) return;

    canvas.setBackgroundColor(
      theme === "dark" ? "#1a1a1a" : "#ffffff",
      () => canvas.renderAll()
    );
  }, [theme, canvas]);
  return (
    <div>
      <canvas ref={canvasRef} id='canvas' />
    </div>
  )
}

export default CanvasRender;