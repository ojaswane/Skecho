"use client";
import React, { useState, useEffect } from "react";

const PRESET_COLORS = [
  "#FF0000", "#FFA500", "#FFFF00",
  "#00FF00", "#00FFFF", "#0000FF",
  "#800080", "#000000", "#FFFFFF"
];

interface ColorPaletteProps {
  value?: string;
  onChange?: (color: string) => void;
}

export default function ColorPalette({ value, onChange }: ColorPaletteProps) {
  const [color, setColor] = useState(value || "#ff0000");

  useEffect(() => {
    if (value) setColor(value);
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onChange?.(newColor);
  };

  return (
    <div className="flex flex-col gap-3 w-[220px]">

      {/* Palette */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((c) => (
          <div
            key={c}
            onClick={() => handleColorChange(c)}
            className="w-8 h-8 rounded border cursor-pointer"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Native Picker */}
      <input
        type="color"
        value={color}
        onChange={(e) => handleColorChange(e.target.value)}
        className="w-full h-10 cursor-pointer rounded"
      />

      {/* HEX Input */}
      <input
        type="text"
        value={color.toUpperCase()}
        onChange={(e) => {
          const hex = e.target.value;
          if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
            handleColorChange(hex);
          }
        }}
        className="border px-2 py-1 rounded text-sm"
      />
    </div>
  );
}
