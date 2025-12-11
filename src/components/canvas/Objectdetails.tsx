"use client";
import React from "react";
import { useCanvasStore } from "../../../lib/store/canvasStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
// import { SketchPicker } from "react-color";
// import { HexColorPicker } from "react-colorful";

import ColorPickerEditor from "./colorpicker";
const Objectdetails = () => {
  const selectedObject = useCanvasStore((s) => s.selectedObject);

  const updateFillColor = (color: any) => {
    const canvas = useCanvasStore.getState().canvas;
    const active = canvas?.getActiveObject();
    if (!active) return;

    active.set("fill", color.hex);
    canvas?.renderAll();

    useCanvasStore.getState().setSelectedObject(active);
  };


  return (
    <div
      className="
        w-64 
        h-full 
        mt-10
        rounded-xl
        border border-white/20
        bg-white/10 
        dark:bg-white/5
        backdrop-blur-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.15)]
        flex flex-col
      "
    >

      {/* Header */}
      <div className="p-4 border-b border-white/20 font-semibold backdrop-blur-xl">
        Design Properties
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 w-full ">

        {!selectedObject ? (
          <p className="text-sm opacity-60">No object selected</p>
        ) : (
          <>
            <div className="flex flex-col w-20 gap-6">

              {/* POSITION */}
              <Section title="Position">
                <Row>
                  <Input label="X" value={selectedObject.left} />
                  <Input label="Y" value={selectedObject.top} />
                </Row>
              </Section>

              {/* SIZE */}
              <Section title="Size">
                <Row>
                  <Input label="W" value={selectedObject.width} />
                  <Input label="H" value={selectedObject.height} />
                </Row>
              </Section>

              {/* FILL */}
              <Section title="Fill">
                <Popover>
                  <PopoverTrigger
                    className="
                w-full h-9 rounded-4xl
                border border-white/20
                bg-white/20 
                dark:bg-white/10
                cursor-pointer
                "
                  >
                    <PopoverContent>
                      <ColorPickerEditor />
                    </PopoverContent>
                  </PopoverTrigger>
                </Popover>
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <div>
    <h2 className="text-xs uppercase opacity-60 mb-1 tracking-wider">{title}</h2>
    {children}
  </div>
);

const Row = ({ children }: any) => (
  <div className="flex gap-2">{children}</div>
);

const Input = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col w-full">
    <label className="text-[10px] uppercase opacity-60">{label}</label>
    <input
      className="
        h-8 
        rounded 
        border border-white/20
        bg-white/10 
        dark:bg-white/10
        backdrop-blur-md
        px-2 
        text-sm
        focus:outline-none
      "
      value={Math.round(value)}
    />
  </div>
);

export default Objectdetails;
