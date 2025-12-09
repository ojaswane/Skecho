'use client'
import React, { useEffect } from 'react'
import { useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasStore } from '../../../lib/store/canvasStore'

const CanvasRender = ({ theme }: { theme: "light" | "dark" }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = React.useState<any>(null);
  const { setCanvas: setStoreCanvas, setSelectedObject } = useCanvasStore();

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

      // Delete key handler (attach once and clean up)
      const onKeyDown = (e: KeyboardEvent) => {
        const key = e.key;

        if (key === "Delete" || key === "Backspace") {
          const active = initCanvas.getActiveObject();
          if (active) {
            initCanvas.remove(active);
            initCanvas.requestRenderAll();
          }
        }
      };
      window.addEventListener("keydown", onKeyDown);

      // Wire up selection/object events to update store
      initCanvas.on("selection:created", (e: any) => {
        setSelectedObject(e.selected?.[0] || null);
      });

      initCanvas.on("selection:updated", (e: any) => {
        setSelectedObject(e.selected?.[0] || null);
      });

      initCanvas.on("selection:cleared", () => {
        setSelectedObject(null);
      });

      // Track live updates when user moves or scales:
      initCanvas.on("object:moving", (e: any) => {
        setSelectedObject(e.target || null);
      });

      initCanvas.on("object:scaling", (e: any) => {
        setSelectedObject(e.target || null);
      });

      initCanvas.on("object:modified", (e: any) => {
        setSelectedObject(e.target || null);
      });

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        initCanvas.dispose();
      }
    }
  }, []);

  useEffect(() => {
    if (!canvas) return;

    const updateProps = (obj: fabric.Object) => {
      useCanvasStore.getState().setSelectedObject({
        id: obj.id,
        left: obj.left ?? 0,
        top: obj.top ?? 0,
        width: (obj.width ?? 0) * (obj.scaleX ?? 1),
        height: (obj.height ?? 0) * (obj.scaleY ?? 1),
        fill: obj.fill as string,
        stroke: obj.stroke as string,
        strokeWidth: obj.strokeWidth,
      });
    };
  }, [canvas]);

  return (
    <div>
      <canvas ref={canvasRef} id='canvas' />
    </div>
  )
}

export default CanvasRender;


// useEffect(() => {
//   if (!canvas) return;

//   canvas.setBackgroundColor(
//     theme === "dark" ? "#1a1a1a" : "#ffffff",
//     () => canvas.renderAll()
//   );
// }, [theme, canvas]);