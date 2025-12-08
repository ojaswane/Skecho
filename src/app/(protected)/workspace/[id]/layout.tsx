"use client";

import Navbar from "@/components/canvas/Navbar";
import Toolbar from "@/components/canvas/Toolbar";
import CanvasBoard from "@/components/canvas/Canvas";
import { useCanvasStore } from "../../../../../lib/store/canvasStore";
import Objectdetails from "@/components/canvas/Objectdetails";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useCanvasStore((s) => s.theme);

  return (
    <main className="flex flex-col h-screen dark:bg-[#1a1a1a] bg-white dark:text-white text-black">
      <Navbar />

      <div className="flex-1 flex justify-center items-center">
        {/* This is the objects details */}
        <Objectdetails />
        <CanvasBoard theme={theme} />
      </div>

      <Toolbar />
    </main>
  );
};

export default Layout;
