"use client";

import Navbar from "@/components/canvas/Navbar";
import Toolbar from "@/components/canvas/Toolbar";
import CanvasBoard from "@/components/canvas/Canvas";
import { useCanvasStore } from "../../../../../lib/store/canvasStore"; // if using zustand

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useCanvasStore((s) => s.theme); // "light" | "dark"

  return (
    <main className="flex flex-col h-screen">
      <Navbar />

      <div className="flex-1 flex justify-center items-center">
        <CanvasBoard theme={theme} />
      </div>

      <Toolbar />
    </main>
  );
};

export default Layout;
