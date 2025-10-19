"use client"

import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon } from "lucide-react"

export default function MoodboardPage() {
  return (
    <div className="p-6">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="generate">Generate with AI</TabsTrigger>
        </TabsList>

        {/* ---- Upload Section ---- */}
        <TabsContent value="images">
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-neutral-900 text-gray-200 relative">
            <p className="text-sm">Drag and drop your images</p>

            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button variant="secondary" size="sm" className="bg-neutral-800 hover:bg-neutral-700 text-white">
                Import
              </Button>
              <Button variant="default" size="sm" className="bg-white text-black hover:bg-gray-200">
                Generate using AI
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ---- AI Generate Section ---- */}
        <TabsContent value="generate">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-10 bg-neutral-900 text-gray-200">
            <ImageIcon className="w-10 h-10 mb-3 opacity-70" />
            <p className="text-sm mb-2">Generate moodboard using AI</p>
            <Button variant="default" size="sm" className="bg-white text-black hover:bg-gray-200">
              Generate Now
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
