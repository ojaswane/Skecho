"use client";
import React, { useRef, useState, useEffect } from "react";
import { useCanvasStore } from "../../../lib/store/canvasStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Rect } from "fabric";
import ColorPickerEditor from "./colorpicker";
import StrokeSettings from "./ui/StrokeSettings";
import Textoptions from "./Textoptions";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Crop } from "lucide-react";
import { BLEND_MODES } from "./data/data";
import { Button } from "../ui/button";


const Objectdetails = () => {
  const selectedObject = useCanvasStore((s) => s.selectedObject);
  const [colorSet, setColor] = useState("#ffffff");
  const [BlendMode, setBlendMode] = useState("Normal");
  const previewRef = useRef<string>("Normal");

  const cropRectRef = useRef<Rect | null>(null);
  const croppedObjectRef = useRef<any>(null);


  const updateFillColor = (color: any) => {
    const canvas = useCanvasStore.getState().canvas;
    const active = canvas?.getActiveObject();
    if (!active) return;

    active.set("fill", color.hex);
    setColor(color.hex);
    canvas?.renderAll();

    useCanvasStore.getState().setSelectedObject(active);
  };

  const isTextObject =
    selectedObject &&
    ["text", "i-text", "textbox"].includes(selectedObject.type as string);



  const UpdateBlend = (mode: string) => {
    const canvas = useCanvasStore.getState().canvas;
    const obj = canvas?.getActiveObject();
    if (!obj) return;

    obj.set({ globalCompositeOperation: mode });
    canvas?.renderAll();
  };

  const PreviewBlend = (mode: string) => {
    const canvas = useCanvasStore.getState().canvas;
    const obj = canvas?.getActiveObject();
    if (!obj) return;

    obj.set({ globalCompositeOperation: mode });
    canvas?.renderAll();
  };

  const ResetPreview = () => {
    const canvas = useCanvasStore.getState().canvas;
    const obj = canvas?.getActiveObject();
    if (!obj || !previewRef.current) return;

    obj.set({ globalCompositeOperation: previewRef.current });
    canvas?.renderAll();
  };

  useEffect(() => {
    const canvas = useCanvasStore.getState().canvas;
    if (!canvas) return;

    const handleSelection = () => {
      const obj = canvas.getActiveObject();
      if (!obj) return;

      const blend = obj.globalCompositeOperation || "normal";
      previewRef.current = blend;
      setBlendMode(blend);

      useCanvasStore.getState().setSelectedObject(obj);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
    };
  }, []);


  // Handle crop
  const isCropObject =
    selectedObject &&
    ["image"].includes(selectedObject.type as string);


  const previewCrop = () => {
    const canvas = useCanvasStore.getState().canvas;
    const img = croppedObjectRef.current;
    const cropRect = cropRectRef.current;

    if (!canvas || !img || !cropRect) return;

    const clip = new Rect({
      width: cropRect.getScaledWidth(),
      height: cropRect.getScaledHeight(),
      originX: "center",
      originY: "center",
    });

    img.set({ clipPath: clip });
    canvas.renderAll();
  };

  const handleCrop = () => {
    const canvas = useCanvasStore.getState().canvas;
    const obj = canvas?.getActiveObject();

    if (!canvas || !obj || obj.type !== "image") return;

    obj.selectable = false;
    croppedObjectRef.current = obj;

    const cropRect = new Rect({
      left: obj.left,
      top: obj.top,
      width: obj.getScaledWidth(),
      height: obj.getScaledHeight(),
      fill: "rgba(0,0,0,0.25)",
      stroke: "#4f46e5",
      strokeDashArray: [6, 4],
      hasRotatingPoint: false,
      lockRotation: true,
      transparentCorners: false,
    });

    cropRect.setControlsVisibility({ mtr: false });

    cropRectRef.current = cropRect;

    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);

    canvas.on("object:moving", previewCrop);
    canvas.on("object:scaling", previewCrop);
  };


  return (
    <div
      className="
        w-64 h-full mt-10 rounded-xl
        border border-white/20
        bg-white/10 dark:bg-white/5
        backdrop-blur-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.15)]
        flex flex-col
      "
    >
      <div className="p-4 border-b border-white/20 font-semibold backdrop-blur-xl">
        Design Properties
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 w-full">
        {!selectedObject ? (
          <p className="text-sm opacity-60">No object selected</p>
        ) : (
          <div className="flex flex-col w-20 gap-6">
            <Section title="Position">
              <Row>
                <Input label="X" value={selectedObject.left} />
                <Input label="Y" value={selectedObject.top} />
              </Row>
            </Section>

            <Section title="Size">
              <Row>
                <Input label="W" value={selectedObject.width} />
                <Input label="H" value={selectedObject.height} />
              </Row>
            </Section>

            <div className="flex gap-2">
              <Section title="Fill">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-8 w-20 rounded border border-white/20 bg-white/10">
                      <div
                        className="w-full h-full rounded"
                        style={{
                          backgroundColor:
                            typeof selectedObject?.fill === "string"
                              ? selectedObject.fill
                              : "#ffffff",
                        }}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" className="p-0">
                    <ColorPickerEditor onChange={updateFillColor} />
                  </PopoverContent>
                </Popover>
              </Section>

              <Section title="Rotate">
                <input
                  className="h-8 w-20 rounded border border-white/20 bg-white/10 px-2 text-sm"
                  value={Math.round(selectedObject.angle || 0)}
                  readOnly
                />
              </Section>
            </div>

            <Section>
              <StrokeSettings />
            </Section>

            {isTextObject && (
              <Section>
                <Textoptions />
              </Section>
            )}

            <Section title="Blend">
              <Select
                value={selectedObject?.globalCompositeOperation || "normal"}
                onValueChange={UpdateBlend}
              >
                <SelectTrigger className="h-10 w-43 bg-white/10 border border-white/20 text-sm capitalize">
                  <SelectValue>{BlendMode}</SelectValue>
                </SelectTrigger>

                <SelectContent className="bg-zinc-900 border border-zinc-800">
                  {BLEND_MODES.map((blend) => (
                    <SelectItem
                      key={blend}
                      value={blend}
                      className="capitalize cursor-pointer"
                      onMouseEnter={() => PreviewBlend(blend)}
                      onMouseDown={ResetPreview}
                    >
                      {blend}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Section>

            {isCropObject && (
              <Section>

                <label className="text-[11px] uppercase tracking-wide opacity-60">
                  crop
                </label>
                <Button
                  className="bg-white/5 border-2 hover:bg-white/10 border-white/20"
                  onClick={handleCrop}
                >
                  <Crop />
                </Button>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <div>
    {title && (
      <h2 className="text-xs uppercase opacity-60 mb-1 tracking-wider">
        {title}
      </h2>
    )}
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
      className="h-8 rounded border border-white/20 bg-white/10 px-2 text-sm"
      value={Math.round(value)}
      readOnly
    />
  </div>
);

export default Objectdetails;
