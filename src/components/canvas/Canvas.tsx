'use client'
import React, { useEffect } from 'react'
import { useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasStore } from '../../../lib/store/canvasStore'
import FrameOverlays from './FrameOverlays';
import type { Frame } from '../../../lib/store/canvasStore'

const CanvasRender = ({ theme }: { theme: "light" | "dark" }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = React.useState<any>(null);
  const { setCanvas: setStoreCanvas, setSelectedObject } = useCanvasStore();


  // besic functionality for canvas
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

        if (key === "Delete") {
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

  // for default frame 
  useEffect(() => {
    const { canvas, frames, addFrame } = useCanvasStore.getState()
    if (!canvas || frames.length > 0) return;

    const id = crypto.randomUUID();

    const width = 1440
    const height = 1024

    const frame: Frame = {
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
    console.log("frame created")
    console.log(frame)
    addFrame(frame)
    canvas.renderAll()
  }, [])

  //for zooming and panning

  // this prevents the zoom for browser
  // useEffect(() => {
  //   const preventZoom = (e: WheelEvent) => {
  //     if (e.ctrlKey) {
  //       e.preventDefault();
  //     }
  //   };

  //   window.addEventListener("wheel", preventZoom, { passive: false });

  //   return () => {
  //     window.removeEventListener("wheel", preventZoom);
  //   };
  // }, []);

  useEffect(() => {
    if (!canvas) return;

    const onWheel = (opt: any) => {
      const e = opt.e;
      const delta = e.deltaY;
      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform!;

      if (e.ctrlKey) {
        let newZoom = zoom * (delta > 0 ? 0.95 : 1.05);

        // clamp zoom 
        newZoom = Math.min(Math.max(newZoom, 0.1), 6);

        const pointer = canvas.getPointer(e);

        canvas.zoomToPoint(
          new fabric.Point(pointer.x, pointer.y),
          newZoom
        );
      }
      else if (e.shiftKey) {
        vpt[4] -= delta;
      }

      else {
        vpt[5] -= delta;
      }

      canvas.requestRenderAll();
      e.preventDefault();
      e.stopPropagation();
    };

    canvas.on("mouse:wheel", onWheel);
    return () => {
      canvas.off("mouse:wheel", onWheel);
    };
  }, [canvas]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Fabric Canvas */}
      <canvas ref={canvasRef} />

      {/* HTML Overlay Layer at the frame */}
      <div className="absolute inset-0 pointer-events-none">
        <FrameOverlays />
      </div>
    </div>

  )
}
export default CanvasRender;


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

// useEffect(() => {
//   if (!canvas) return;

//   canvas.setBackgroundColor(
//     theme === "dark" ? "#1a1a1a" : "#ffffff",
//     () => canvas.renderAll()
//   );
// }, [theme, canvas]);