"use client";

import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Hash, Type } from "lucide-react";
import ImageUploader from "@/components/ui/inputfield/imageuploader";

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

        {/* Canvas Tab */}
        <TabsContent value="moodboard" className="p-4">
          {/* Image Upload Section */}
          <ImageUploader />
        </TabsContent>

        {/* Style Guide Tab */}
        <TabsContent value="style-guide" className="p-4">
          {/* Nested Tabs for Colors / Typography */}
          <Tabs defaultValue="colors">
            <TabsList className="grid w-full sm:w-fit h-auto grid-cols-2 rounded-full backdrop-blur-xl dark:bg-white/[0.08] border border-black/40 dark:border-white/[0.12] saturate-150 p-2 mb-4">
              <TabsTrigger value="colors" className="border-rounded-4xl">
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography" className="">
                Typography
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors">
              {/* Your color section UI will go here */}
              <div className="text-gray-300">🎨 Colors section content</div>
            </TabsContent>

            <TabsContent value="typography">
              {/* Your typography section UI will go here */}
              <div className="text-gray-300">🔤 Typography section content</div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </>
  );
}
