"use client";
import { useState, useEffect, useRef } from "react";

const PRESET_COLORS = [
  "#FF0000", "#FFA500", "#FFFF00",
  "#00FF00", "#00FFFF", "#0000FF",
  "#800080", "#000000", "#FFFFFF"
];

interface colorpicker {
  value?: string;
  onChange?: (color: any) => void;
}

interface Hex {
  hex: string;
  updated: string[];
}
export default function ColorPickerEditor({ value, onChange }: colorpicker) {
  const [hex, setHex] = useState(value || "#ff0000");
  const [opacity, setOpacity] = useState(1);
  const [recent, setRecent] = useState([]);

  const boxRef = useRef(null);
  const [sat, setSat] = useState(100);
  const [light, setLight] = useState(50);
  const [hue, setHue] = useState(0);

  //  Convert HSL → HEX
  function hslToHex(h: any, s: any, l: any) {
    s /= 100;
    l /= 100;
    const k = (n: any) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: any) =>
      Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
    return `#${f(0).toString(16).padStart(2, "0")}${f(8)
      .toString(16)
      .padStart(2, "0")}${f(4).toString(16).padStart(2, "0")}`;
  }

  // update the hsl
  useEffect(() => {
    const newHex = hslToHex(hue, sat, light);
    setHex(newHex);

    if (onChange) {
      onChange({
        hex: newHex,
        hsl: { h: hue, s: sat, l: light },
        opacity: opacity,
        rgba: hexToRGBA(newHex, opacity),
      });
    }
  }, [hue, sat, light, opacity]);


  useEffect(() => {
    if (!recent.includes(hex)) {
      const updated = [hex, ...recent].slice(0, 6);
      setRecent(updated);
      localStorage.setItem("recentColors", JSON.stringify(updated));
    }
  }, [hex]);

  useEffect(() => {
    const saved = localStorage.getItem("recentColors");
    if (saved) setRecent(JSON.parse(saved));
  }, []);

  // Converts HEX to RGBA
  function hexToRGBA(hex: string, opacity = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Handle color box drag

  const handleDrag = (e: any) => {
    const rect = boxRef.current?.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);

    const satVal = Math.round((x / rect.width) * 100);
    const lightVal = Math.round(100 - (y / rect.height) * 100);

    setSat(satVal);
    setLight(lightVal);
  };

  const startDrag = () => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const stopDrag = () => {
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", stopDrag);
  };

  return (
    <div className="w-[260px] flex flex-col gap-4 p-3 border rounded-lg bg-white shadow">

      {/*  COLOR BOX */}
      <div
        ref={boxRef}
        onMouseDown={startDrag}
        className="relative w-full h-36 rounded-lg cursor-crosshair"
        style={{
          background: `hsl(${hue}, 100%, 50%)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black"></div>

        {/* Selector circle */}
        <div
          className="absolute w-4 h-4 border-2 border-white rounded-full shadow"
          style={{
            left: `${sat}%`,
            top: `${100 - light}%`,
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      </div>

      {/* - HUE SLIDER */}
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={(e) => setHue(Number(e.target.value))}
        className="w-full h-2 rounded-lg cursor-pointer"
        style={{
          background:
            "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)"
        }}
      />

      {/* OPACITY SLIDER  */}
      <div className="relative w-full h-2 rounded bg-gray-200">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="w-full absolute top-0 h-2 opacity-100 cursor-pointer"
          style={{
            background: `linear-gradient(to right, transparent, ${hex})`
          }}
        />
      </div>

      {/* - HEX INPUT */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">HEX</span>
        <input
          type="text"
          value={hex.toUpperCase()}
          onChange={(e) => {
            let v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
              setHex(v);
            }
          }}
          className="flex-1 border px-2 py-1 rounded text-sm"
        />
      </div>

      {/*  PRESET COLORS */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((c) => (
          <div
            key={c}
            onClick={() => setHex(c)}
            className="w-7 h-7 rounded border cursor-pointer"
            style={{ background: c }}
          />
        ))}
      </div>

      {/* RECENT COLORS */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Recent</p>
        <div className="flex gap-2 flex-wrap">
          {recent.map((c, i) => (
            <div
              key={i}
              onClick={() => setHex(c)}
              className="w-7 h-7 rounded border cursor-pointer"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
