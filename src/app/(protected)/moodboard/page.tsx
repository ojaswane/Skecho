"use client"

import React from "react"
import tabs from "./layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function MoodboardPage() {
  return (
    <>
      <Tabs defaultValue="canvas">
        <TabsContent value="canvas" >
            Canvas content 
        </TabsContent>

        <TabsContent value="style-guide" >
          <div>
            style guide content
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
