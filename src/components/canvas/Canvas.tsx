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

      // Delete key handler 
      const onKeyDown = (e: KeyboardEvent) => {
        const key = e.key;

        if (key === "Delete" ) {
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

  useEffect((() => {
      const { canvas, frames, addFrame, setActiveFrame } = useCanvasStore.getState()
      if (!canvas || frames.length > 0) return;
  
      const id = crypto.randomUUID();
  
      const width = 320
      const height = 800
  
      const frame = {
        id,
        device: "desktop",
        badge: "idea",
        width,
        height,
        left: canvas.getWidth() / 2 - width / 2,
        top: 80,
        locked: false,
        
      }
  
      const rect = new fabric.Rect({
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height,
        fill: "#d1d1d1",
        stroke: "#888",
        strokeDashArray: [6, 6],
        selectable: false,
        evented: false,
      })
  
      rect.set("frameId", id)
      canvas.add(rect)
      canvas.renderAll()
    }), []) 
  // ======================= TODO : Add this back later =======================

  // useEffect(() => {
  //   if (!canvas) return;

  //   const updateProps = (obj: fabric.Object) => {
  //     useCanvasStore.getState().setSelectedObject({
  //       left: obj.left ?? 0,
  //       top: obj.top ?? 0,
  //       width: (obj.width ?? 0) * (obj.scaleX ?? 1),
  //       height: (obj.height ?? 0) * (obj.scaleY ?? 1),
  //       fill: obj.fill as string, 
  //       stroke: obj.stroke as string,
  //       strokeWidth: obj.strokeWidth,
  //     });
  //   };
  // }, [canvas]);

  return (
    <div  className="w-full " >
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