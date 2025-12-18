"use client";
import React from "react";
import { useCanvasStore } from "../../../lib/store/canvasStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import ColorPickerEditor from "./colorpicker";
import StrokeSettings from "./ui/StrokeSettings";
import Textoptions from "./Textoptions";
import { Button } from "../ui/button";
import { ChevronsUpDown } from 'lucide-react';

const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
]

const Objectdetails = () => {
  const selectedObject = useCanvasStore((s) => s.selectedObject);
  const [colorSet, setColor] = React.useState("#ffffff");

  const updateFillColor = (color: any) => {
    const canvas = useCanvasStore.getState().canvas;
    const active = canvas?.getActiveObject();
    if (!active) return;

    active.set("fill", color.hex);
    setColor(color.hex);
    canvas?.renderAll();

    useCanvasStore.getState().setSelectedObject(active);
  };



  // Helper function to for textoptions
  const isTextObject =
    selectedObject &&
    ["text", "i-text", "textbox"].includes(selectedObject.type as string);


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

              <Section title="Position" >
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

              <div className="flex gap-2">
                {/* FILL */}
                <Section title="Fill" >
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="
                                  h-8 w-20 rounded
                                  border border-white/20
                                  bg-white/10
                                  backdrop-blur-md
                                  flex items-center 
                                  cursor-pointer
                                "
                      >
                        <div
                          className="w-full h-full rounded"
                          style={{
                            backgroundColor:
                              typeof selectedObject?.fill === "string"
                                ? selectedObject.fill
                                : typeof selectedObject?.backgroundColor === "string"
                                  ? selectedObject.backgroundColor
                                  : "#ffffff",
                          }}
                        />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      side="right"
                      align="start"
                      className="p-0"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="colorpicker-area">
                        <ColorPickerEditor onChange={updateFillColor} />
                      </div>
                    </PopoverContent>
                  </Popover>
                </Section>

                {/* ROTATE */}
                <Section title="Rotate">
                  <div className="relative">
                    <input
                      className="
            h-8 w-20 rounded
            border border-white/20
            bg-white/10
            backdrop-blur-md
            px-2 pr-6 text-sm
            focus:outline-none
          "
                      value={Math.round(selectedObject.angle || 0)}
                      readOnly
                    />
                    <span className="absolute right-2 w-2 top-1/2 -translate-y-1/2 text-[20px] opacity-60">
                      °
                    </span>
                  </div>
                </Section>
              </div>



              {/* Stroke sections */}
              <Section className="w-full ">
                <StrokeSettings />
              </Section>


              {/* Text Sections */}
              {isTextObject && (
                <Section type="text">
                  <Textoptions />
                </Section>
              )}

              {/* blend mode */}
              {/* Blend Mode */}
              <Section>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-wide opacity-60">
                    Blend
                  </label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="
                        bg-white/10 
                        h-12 w-43
                        flex items-center justify-between 
                        border border-white/20 dark:border-zinc-800 "

                      >
                        <span className="text-sm capitalize">
                          {selectedObject?.globalCompositeOperation || "normal"}
                        </span>
                        <ChevronsUpDown className="w-4 h-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      side="right"
                      align="start"
                      className="
                              w-44 p-1
                              bg-zinc-900
                              border border-zinc-800
                              shadow-xl
                            "
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="max-h-72 overflow-y-auto">
                        {BLEND_MODES.map((blend) => (
                          <button
                            key={blend}
                            className={`
                            w-full px-3 py-2 text-left text-sm rounded
                            capitalize
                            transition
                            ${selectedObject?.globalCompositeOperation === blend
                                ? "bg-white/20 text-white"
                                : "hover:bg-white/10 text-white/80"
                              }
              `}
                          >
                            {blend}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
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

const Row = ({ children }: any) => <div className="flex gap-2">{children}</div>;

const Input = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col w-full">
    <label className="text-[10px] uppercase opacity-60">{label}</label>
    <input
      className="
          h-8 rounded 
          border border-white/20
          bg-white/10 dark:bg-white/10
          backdrop-blur-md
          px-2 text-sm
          focus:outline-none
        "
      value={Math.round(value)}
      readOnly
    />
  </div>
);

export default Objectdetails;
