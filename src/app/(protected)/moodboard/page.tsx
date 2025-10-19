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
        <TabsList className="grid w-full sm:w-fit h-auto grid-cols-2 rounded-full backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] saturate-150 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-3 cursor-pointer rounded-xl data-[state=active]:backdrop-blur-xl data-[state=active]:bg-white/[0.15] data-[state=active]:border data-[state=active]:border-white/[0.12] transition-all duration-200 text-xs sm:text-sm"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

    </>
  )
}
