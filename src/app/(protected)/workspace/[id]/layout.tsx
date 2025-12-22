"use client";

import Navbar from "@/components/canvas/options_pages/Navbar";
import Toolbar from "@/components/canvas/options_pages/Toolbar";
import CanvasBoard from "@/components/canvas/Canvas";
import Objectdetails from "@/components/canvas/options_pages/Objectdetails";
import { useCanvasStore } from "../../../../../lib/store/canvasStore";
import { useEffect } from "react";
import * as fabric from 'fabric';
import Layers from "@/components/canvas/options_pages/Layers";

const Layout = () => {
  const theme = useCanvasStore((s) => s.theme);




  return (
    <main className="flex flex-col h-screen dark:bg-[#1a1a1a] bg-white dark:text-white text-black">

      {/* TOP NAV */}
      <Navbar />

      {/* MAIN EDITOR AREA */}
      <div className="flex flex-1 overflow-hidden">

        {/* Layers */}
        <div className="w-72">
          <Layers />
        </div>

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
