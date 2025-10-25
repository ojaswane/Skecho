"use client";

import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Hash, Type, Download } from "lucide-react";
import ImageUploader from "@/components/ui/inputfield/imageuploader";
import { Button } from "@/components/ui/button";
import ColorGuide from "@/components/style-guide/ColorGuide";
import TypographyGuide from "@/components/style-guide/TypographyGuide";
import { Bookmark } from 'lucide-react';
import { toast } from "sonner"

export const tabs = [
  {
    value: "moodboard",
    label: "Moodboard",
    icon: Hash,
  },
  {
    value: "style-guide",
    label: "Style Guide",
    icon: Type,
  },
] as const;

export default function MoodboardPage() {
  return (
    <>
      <Tabs defaultValue="moodboard" className="w-full">
        {/* Top-level Tabs for Canvas / Style Guide */}
        <div className="w-full flex justify-center items-center">
          <TabsList className="grid w-full sm:w-fit h-auto grid-cols-2 rounded-full backdrop-blur-xl dark:bg-white/[0.08] border border-black/40 dark:border-white/[0.12] saturate-150 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="
                    flex items-center gap-3 cursor-pointer rounded-xl
                    data-[state=active]:backdrop-blur-3xl 
                    data-[state=active]:bg-white/90 
                    data-[state=active]:border data-[state=active]:border-gray-400 
                    data-[state=active]:shadow-xl 
                    shadow-sm hover:shadow-lg
                    transition-all duration-300 
                    text-xs sm:text-sm
                    text-gray-800 dark:text-gray-200
                  "
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>



        {/* moodboardd Tab */}
        <TabsContent value="moodboard" className="p-4">
          <ImageUploader />
        </TabsContent>

        {/* Style Guide Tab */}
        <TabsContent value="style-guide" className="p-4">
          <Tabs defaultValue="colors">
            <div className="mt-2 flex flex-row justify-between items-center">
              <TabsList className="grid w-full sm:w-fit h-auto grid-cols-2 rounded-full backdrop-blur-xl dark:bg-white/[0.08] border border-black/40 dark:border-white/[0.12] saturate-150 p-2 mb-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
              </TabsList>


              <div className="relative flex flex-row justify-center items-center gap-3">
                {/* Save Button */}
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer transition-all active:scale-90"
                    onClick={() => toast("✅ Style Guide Saved Successfully!")}
                  >
                    <Bookmark className="h-4 mr-0" />
                  </Button>
                  <span
                    className="absolute top-9 left-1/2 -translate-x-1/2 scale-90 opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 bg-black/80 px-2 py-0.5 rounded-md transition-all duration-200"
                  >
                    Save
                  </span>
                </div>

                {/* Download Button */}
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer transition-all active:scale-90"
                    onClick={() => toast("⬇️ Download Started")}
                  >
                    <Download className="h-4 mr-0" />
                  </Button>
                  <span
                    className="absolute top-9 left-1/2 -translate-x-1/2 scale-90 opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 bg-black/80 px-2 py-0.5 rounded-md transition-all duration-200"
                  >
                    Download
                  </span>
                </div>
              </div>
            </div>


            <TabsContent value="colors">
              <ColorGuide />
            </TabsContent>

            <TabsContent value="typography">
              <TypographyGuide />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </>
  );
}
