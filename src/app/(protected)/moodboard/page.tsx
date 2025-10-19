"use client"

import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Hash, Type } from "lucide-react"

export const tabs = [
  {
    value: "canvas",
    label: "Canvas",
    icon: Hash
  },
  {
    value: "style-guide",
    label: "Style Guide",
    icon: Type
  },
] as const

export default function MoodboardPage() {
  return (
    <>
      <Tabs defaultValue="canvas">
        <div className="w-full flex justify-center items-center">
          <TabsList className="grid w-full sm:w-fit h-auto grid-cols-2 rounded-full backdrop-blur-xl dark:bg-white/[0.08] border border-black/40 dark:border-white/[0.12] saturate-150 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
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
              )
            })}
          </TabsList>
        </div>

        {/* Content */}
        <TabsContent value="canvas" className="p-4">
          <p>Canvas content goes here</p>
        </TabsContent>
        <TabsContent value="style-guide" className="p-4">
          <p>Style Guide content goes here</p>
        </TabsContent>
      </Tabs>
    </>
  )
}
