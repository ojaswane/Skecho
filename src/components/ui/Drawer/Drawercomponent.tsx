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
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useProjectStore } from "../../../../lib/store/projectStore"
import { useUserStore } from "../../../../lib/store/userStore"
import toast from "react-hot-toast"

export default function NewProjectDrawer() {
  const router = useRouter()
  const { addProject } = useProjectStore()
  const { user } = useUserStore()

  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  // ✅ Handle create project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!user?.id) {
        console.error("No user logged in")
        toast.error("No user logged in")
        return
      }
      const project = await addProject({
        user_id: user?.id!,
        name: projectName || "Untitled Project",
        description,
      })

      // redirect to workspace after project is created
      const createdProject = project as { id?: string | number } | undefined
      if (createdProject?.id) router.push(`/workspace/${createdProject.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Skip button logic
  const handleSkip = async () => {
    setLoading(true)
    try {
      if (!user?.id) {
        console.error("No user logged in")
        toast.error("No user logged in")
        return
      }
      const project = await addProject({
        user_id: user?.id!,
        name: "Untitled Project",
        description: "",
      })
      const createdProject = project as { id?: string | number } | undefined
      if (createdProject?.id) router.push(`/workspace/${createdProject.id}`)
    } catch (error) {
      console.error("Error skipping project creation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer>
      {/* Trigger Button */}
      <DrawerTrigger asChild>
        <Button className="cursor-pointer">
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

        <form onSubmit={handleSubmit} className="p-10 mb-10 space-y-4 w-1/2 mx-auto ">
          <div>
            <label className="block text-sm font-medium mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
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

          <DrawerFooter className=" p-0 flex flex-col gap-4 ">
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? "Creating..." : "Create Project"}
            </Button>
            <div className="w-full flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="w-1/2 cursor-pointer"
              >
                {loading ? "Skipping..." : "Skip (Untitled)"}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="w-1/2 bg-red-600 hover:bg-red-700 cursor-pointer "
                >
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}