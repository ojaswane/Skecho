"use client";

import Navbar from "@/components/canvas/Navbar";
import Toolbar from "@/components/canvas/Toolbar";
import CanvasBoard from "@/components/canvas/Canvas";
import Objectdetails from "@/components/canvas/Objectdetails";
import { useCanvasStore } from "../../../../../lib/store/canvasStore";

const Layout = () => {
  const theme = useCanvasStore((s) => s.theme);

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
