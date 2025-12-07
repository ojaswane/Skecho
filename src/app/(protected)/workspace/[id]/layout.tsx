"use client";

import Navbar from "@/components/canvas/Navbar";
import Toolbar from "@/components/canvas/Toolbar";
import CanvasBoard from "@/components/canvas/Canvas";
import { useCanvasStore } from "../../../../../lib/store/canvasStore";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useCanvasStore((s) => s.theme);

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
