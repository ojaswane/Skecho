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
} from "@/components/ui/Drawer"
import { useRouter } from "next/navigation" // ✅ correct hook for app router
import { Plus } from "lucide-react"

export default function NewProjectDrawer() {
  const router = useRouter() // ✅ move here

  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ projectName, description })
    router.push("/workspace") // ✅ works now
  }

  return (
    <Drawer>
      {/* Trigger Button */}
      <DrawerTrigger asChild>
        <Button className=" cursor-pointer ">
          <Plus className="mr-2 h-4 w-4 text-black" />
          New Project
        </Button>
      </DrawerTrigger>

      {/* Drawer Content */}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a New Project</DrawerTitle>
          <DrawerDescription>
            Fill out the details below to create your project.
          </DrawerDescription>
        </DrawerHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-20 space-y-4">
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
