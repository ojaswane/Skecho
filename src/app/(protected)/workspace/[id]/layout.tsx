"use client";

import Navbar from "@/components/canvas/Navbar";
import Toolbar from "@/components/canvas/Toolbar";
import CanvasBoard from "@/components/canvas/Canvas";
import Objectdetails from "@/components/canvas/Objectdetails";
import { useCanvasStore } from "../../../../../lib/store/canvasStore";
import { useEffect } from "react";
import * as fabric from 'fabric';

const Layout = () => {
  const theme = useCanvasStore((s) => s.theme);


  useEffect((() => {
    const { canvas, frames, addFrame, setActiveFrame } = useCanvasStore.getState()
    if (!canvas || frames.length > 0) return;

    const id = crypto.randomUUID();

    const width = 1440
    const height = 1024

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

  return (
    <main className="flex flex-col h-screen dark:bg-[#1a1a1a] bg-white dark:text-white text-black">

      {/* TOP NAV */}
      <Navbar />

      {/* MAIN EDITOR AREA */}
      <div className="flex flex-1 overflow-hidden">

        {/* CANVAS AREA */}
        <div className="flex-1 overflow-hidden">
          <CanvasBoard theme={theme} />
        </div>

        {/* RIGHT SIDEBAR (properties panel) */}
        <div className="w-72 ">
          <Objectdetails />
        </div>

      </div>

      {/* BOTTOM TOOLBAR */}
      <Toolbar />
    </main>
  );
};

export default Layout;
