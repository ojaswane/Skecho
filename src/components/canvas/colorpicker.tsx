"use client";

import { HexColorPicker } from "react-colorful";
import "react-colorful/dist/index.css";
import { useCanvasStore } from "../../../lib/store/canvasStore";

export default function ColorPickerPanel() {
  const selectedObject = useCanvasStore((s) => s.selectedObject);

  if (!selectedObject) return null;

  const updateColor = (color: string) => {
    const canvas = useCanvasStore.getState().canvas;
    const obj = canvas?.getActiveObject();
    if (!obj) return;

    obj.set("fill", color);
    canvas?.renderAll();

    useCanvasStore.getState().setSelectedObject(obj);
  };

  return (
    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl shadow-xl border border-white/20">
      <h3 className="text-white mb-2 text-sm">Fill Color</h3>

      <HexColorPicker
        color={selectedObject.fill as string|| "#000000"}
        onChange={updateColor}
      />
    </div>
  );
}
