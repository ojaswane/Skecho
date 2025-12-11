"use client";
import { useState, useEffect, useRef } from "react";

const PRESET_COLORS = [
  "#FF0000", "#FFA500", "#FFFF00",
  "#00FF00", "#00FFFF", "#0000FF",
  "#800080", "#000000", "#FFFFFF"
];

interface ColorPickerProps {
  value?: string;
  onChange?: (data: {
    hex: string;
    hsl: { h: number; s: number; l: number };
    rgba: string;
    opacity: number;
  }) => void;
}

export default function ColorPickerEditor({ value, onChange }: ColorPickerProps) {
  const [hex, setHex] = useState(value || "#ff0000");
  const [opacity, setOpacity] = useState(1);

  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(100);
  const [light, setLight] = useState(50);

  const [recent, setRecent] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);

  /* UTIL FUNCTIONS  */

  const hexToRGBA = (hex: string, opacity = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);

    const f = (n: number) =>
      Math.round(
        255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))
      );

    return (
      "#" +
      f(0).toString(16).padStart(2, "0") +
      f(8).toString(16).padStart(2, "0") +
      f(4).toString(16).padStart(2, "0")
    );
  };

  const hexToHSL = (hex: string) => {
    let r = parseInt(hex.substr(1, 2), 16) / 255;
    let g = parseInt(hex.substr(3, 2), 16) / 255;
    let b = parseInt(hex.substr(5, 2), 16) / 255;

    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  /* EFFECTS */

  useEffect(() => {
    if (value) {
      setHex(value);
      const hsl = hexToHSL(value);
      setHue(hsl.h);
      setSat(hsl.s);
      setLight(hsl.l);
    }
  }, [value]);

  // When HSL changes → generate hex
  useEffect(() => {
    const newHex = hslToHex(hue, sat, light);
    setHex(newHex);

    onChange?.({
      hex: newHex,
      hsl: { h: hue, s: sat, l: light },
      opacity,
      rgba: hexToRGBA(newHex, opacity),
    });
  }, [hue, sat, light, opacity]);

  // Load recent from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentColors");
    if (saved) setRecent(JSON.parse(saved));
  }, []);

  // Add new color to recent
  useEffect(() => {
    if (!hex) return;
    if (recent.includes(hex)) return;

    const updated = [hex, ...recent].slice(0, 6);
    setRecent(updated);
    localStorage.setItem("recentColors", JSON.stringify(updated));
  }, [hex]);


  /* DRAG HANDLER  */

  const handleDrag = (e: MouseEvent) => {
    if (!boxRef.current) return;

    const rect = boxRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);

    setSat(Math.round((x / rect.width) * 100));
    setLight(Math.round(100 - (y / rect.height) * 100));
  };

  const startDrag = () => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const stopDrag = () => {
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", stopDrag);
  };

  /* UI */

  return (
    <div className="w-[260px] flex flex-col gap-4 p-3 border rounded-lg bg-white/20 dark:bg-white/10  shadow">

      {/* COLOR BOX */}
      <div
        ref={boxRef}
        onMouseDown={startDrag}
        className="relative w-full h-36 rounded-lg cursor-crosshair"
        style={{ background: `hsl(${hue}, 100%, 50%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white" />
        <div className="absolute inset-0 bg-gradient-to-t from-black" />

        {/* Selector */}
        <div
          className="absolute w-4 h-4 border-2 border-white rounded-full shadow"
          style={{
            left: `${sat}%`,
            top: `${100 - light}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* HUE SLIDER */}
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={(e) => setHue(Number(e.target.value))}
        className="w-full h-2 rounded-lg cursor-pointer appearance-none"
        style={{
          background:
            "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
        }}
      />

      {/* OPACITY SLIDER */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={opacity}
        onChange={(e) => setOpacity(Number(e.target.value))}
        className="w-full h-2 rounded cursor-pointer"
        style={{
          background: `linear-gradient(to right, transparent, ${hex})`,
        }}
      />

      {/* HEX INPUT */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-black dark:text-white">HEX</span>
        <input
          type="text"
          value={hex.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
              setHex(v);
              if (v.length === 7) {
                const hsl = hexToHSL(v);
                setHue(hsl.h);
                setSat(hsl.s);
                setLight(hsl.l);
              }
            }
          }}
          className="flex-1 border px-2 py-1 rounded text-sm"
        />
      </div>

      {/* PRESETS */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((c) => (
          <div
            key={c}
            onClick={() => {
              setHex(c);
              const hsl = hexToHSL(c);
              setHue(hsl.h);
              setSat(hsl.s);
              setLight(hsl.l);
            }}
            className="w-7 h-7 rounded border cursor-pointer"
            style={{ background: c }}
          />
        ))}
      </div>

      {/* RECENT */}
      <div>
        <p className="text-xs text-black dark:text-white mb-2">Recent</p>
        <div className="flex gap-2 flex-wrap">
          {recent.map((c, i) => (
            <div
              key={i}
              onClick={() => {
                setHex(c);
                const hsl = hexToHSL(c);
                setHue(hsl.h);
                setSat(hsl.s);
                setLight(hsl.l);
              }}
              className="w-7 h-7 rounded border cursor-pointer"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
