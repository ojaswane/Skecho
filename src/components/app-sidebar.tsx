"use client"

import * as React from "react"
import {
  Frame,
  Settings2,
  LayoutDashboard,
  FolderPlus,
  BookOpen,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabaseclient"
import { useState, useEffect } from "react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{ name: string | null; email: string | null } | null>(null)
  const [projects, setProjects] = useState<any[]>([])

  // ✅ Fetch user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error("Error fetching user:", error.message)
        return
      }
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.full_name || "User",
          email: data.user.email ?? null,
        })
      }
    }

    fetchUser()
  }, [])

  // ✅ Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, category")
        .eq("user_id", user.id)

      if (error) {
        console.error("Error fetching projects:", error.message)
        return
      }

      setProjects(data || [])
    }

    fetchProjects()
  }, [])

  // ✅ Sidebar content
  const data = {
    user: {
      name: user?.name || "User",
      email: user?.email || "user@example.com",
      avatar: `https://ui-avatars.com/api/?name=${user?.name || "User"}`,
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "New Project",
        url: "/workflow",
        icon: FolderPlus,
      },
      {
        title: "Documentation",
        url: "/docs", // ✅ Works now
        icon: BookOpen,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "/settings/general",
          },
          {
            title: "Billing",
            url: "/billing",
          },
        ],
      },
    ],
    projects: projects.map((project) => ({
      name: project.name,
      url: `/dashboard/${project.id}`,
      icon: Frame,
    })),
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <LayoutDashboard size={18} />
          <span className="text-sm font-semibold">Your Workspace</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />

        {projects.length > 0 ? (
          <NavProjects projects={data.projects} />
        ) : (
          <div className="px-4 text-sm text-muted-foreground mt-2">
            No projects yet.
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
