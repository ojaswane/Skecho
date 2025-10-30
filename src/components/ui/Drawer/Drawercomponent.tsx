'use client'

import React, { useState, useEffect } from "react"
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
import { supabase } from "@/lib/supabaseclient"
import toast from "react-hot-toast"

export default function NewProjectDrawer() {
  const router = useRouter()
  const { addProject } = useProjectStore()
  const { user } = useUserStore()

  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [nameExists, setNameExists] = useState(false)
  const [checkingName, setCheckingName] = useState(false)

  // Check if project name already exists 
  const checkProjectName = async (name: string, userId: string) => {
    if (!name.trim()) return setNameExists(false)
    setCheckingName(true)

    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .like("name", name.trim())
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking name:", error)
    }

    setNameExists(!!data)
    setCheckingName(false)
  }

  useEffect(() => {
    if (user?.id && projectName.trim()) {
      checkProjectName(projectName, user.id)
    } else {
      setNameExists(false)
    }
  }, [projectName, user?.id])

  // Handle project creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return toast.error("No user logged in")
    if (nameExists) return toast.error("A project with this name already exists.")

    setLoading(true)
    try {
      const created: Project = await addProject({
        user_id: user.id,
        name: projectName.trim() || "Untitled Project",
        description,
      })


      console.log("Created project:", created)

      if (created?.id) {
        // redirect to workspace with the new id
        router.push(`/workspace/${created.id}`)
        return
      }

      toast.error("Project created but no ID returned.")
    } catch (err: any) {
      console.error("Error creating project:", err)
      toast.error(err?.message || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  // skip the name to untitled
  const handleSkip = async () => {
    if (!user?.id) return toast.error("No user logged in")

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("name")
        .eq("user_id", user.id)
        .ilike("name", "Untitled%")

      if (error) throw error

      const existing = (data || []).map((p) => p.name)
      let counter = 1
      while (existing.includes(`Untitled (${counter})`)) counter++

      const name = counter === 1 ? "Untitled" : `Untitled (${counter})`

      const created = await addProject({
        user_id: user.id,
        name,
        description: "",
      })

      console.log("Created untitled project:", created)

      if (created?.id) {
        router.push(`/workspace/${created.id}`)
        return
      }
      toast.error("Project created but no ID returned.")
    } catch (err: any) {
      console.error("Error creating untitled project:", err)
      toast.error(err?.message || "Failed to create untitled project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4 text-black" />
          New Project
        </Button>
      </DrawerTrigger>

      {/* Drawer UI */}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a New Project</DrawerTitle>
          <DrawerDescription>
            Fill out the details below to create your project.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="p-10 mb-10 space-y-4 w-1/2 mx-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
            {checkingName && (
              <p className="text-xs text-gray-500 mt-1">Checking name...</p>
            )}
            {!checkingName && nameExists && (
              <p className="text-sm text-red-500 mt-1">
                A project with this name already exists.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <DrawerFooter className="p-0 flex flex-col gap-4">
            <Button
              type="submit"
              disabled={loading || nameExists || !projectName.trim()}
              className="cursor-pointer"
            >
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
                  className="w-1/2 bg-red-600 hover:bg-red-700 cursor-pointer"
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