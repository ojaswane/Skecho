'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/Drawer" // 👈 adjust path if needed
// import { plusSign as Plus } from "@/components/ui/lucide-react/plusSign"
export default function NewProjectDrawer() {
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      projectName,
      description
    })
    // 🧠 Here you can add your logic — e.g. Supabase insert or API call
  }

  return (
    <Drawer>
      {/* Trigger Button */}
      <DrawerTrigger asChild>
        {/* <Plus /> */}
        <Button>New Project</Button>
      </DrawerTrigger>

      {/* Drawer Content */}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a New Project</DrawerTitle>
          <DrawerDescription>
            Fill out the details below to create your project.
          </DrawerDescription>
        </DrawerHeader>

        {/* 🧾 The Form */}
        <form onSubmit={handleSubmit} className="p-20 space-y-4 ">
          <div>
            <label className="block text-sm font-medium mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              placeholder="Enter project name"
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <DrawerFooter>
            <Button type="submit">Create Project</Button>
            <DrawerClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
