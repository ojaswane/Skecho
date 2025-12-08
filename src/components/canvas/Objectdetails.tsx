"use client";
import React from "react";
import { useCanvasStore } from "../../../lib/store/canvasStore";

const Objectdetails = () => {
  const selectedObject = useCanvasStore((s) => s.selectedObject);

  return (
    <div className="w-64 h-full border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] flex flex-col">

      {/* Header */}
      <div className="p-3 border-b border-gray-300 dark:border-gray-700 font-semibold">
        Design
      </div>

      {/* Scroll Area (only when needed) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {!selectedObject ? (
          <p className="text-sm opacity-60">No object selected</p>
        ) : (
          <>
            {/* Position */}
            <div>
              <h2 className="text-xs uppercase opacity-60 mb-1">Position</h2>
              <div className="flex gap-2">
                <Input label="X" value={selectedObject.left} />
                <Input label="Y" value={selectedObject.top} />
              </div>
            </div>

            {/* Size */}
            <div>
              <h2 className="text-xs uppercase opacity-60 mb-1">Size</h2>
              <div className="flex gap-2">
                <Input label="W" value={selectedObject.width} />
                <Input label="H" value={selectedObject.height} />
              </div>
            </div>

            {/* Fill */}
            <div>
              <h2 className="text-xs uppercase opacity-60 mb-1">Fill</h2>
              <input
                type="color"
                value={typeof selectedObject.fill === "string" ? selectedObject.fill : "#000000"}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Input = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col w-full">
    <label className="text-[10px] uppercase opacity-60">{label}</label>
    <input
      className="h-7 rounded border px-1 text-sm bg-transparent"
      value={Math.round(value)}
    />
  </div>
);

export default Objectdetails;
