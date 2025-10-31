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
import { useEffect } from "react"
import { useUserStore } from "../../lib/store/userStore"
import { useProjectStore } from "../../lib/store/projectStore"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { user, fetchUser } = useUserStore()
  const { fetchProjects, projects } = useProjectStore() as any

  // Fetch the current user from Supabase
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  //  Fetch projects from Supabase
  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id)
    }
  }, [user?.id, fetchProjects])

  const data = {
    user: {
      name: user?.name || "User",
      email: user?.email || "user@example.com",
      avatar: `https://ui-avatars.com/api/?name=${user?.name || "User"}`,
    },
    navMain: [
      {
        title: "Your Uploads",
        url: "/dashboard",
        icon: LayoutDashboard,
        items: [
          {
            title: "MoodBoard",
            url: "/",
          },
          {
            title: "Your Uploads",
            url: "/starred",
          }
        ],
      },
      {
        title: "Documentation",
        url: "/docs",
        icon: BookOpen,
      },
      {
        title: "Contact us",
        url: "/workflow",
        icon: FolderPlus,
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
    projects: (projects || []).map((project: any) => ({
      name: project.name,
      url: `/workspace/${project.id}`,
      icon: Frame,
    })),
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* HEADER */}
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]/sidebar-wrapper:justify-center">
          <LayoutDashboard size={18} />
          {/* Hide "Sketcho" when collapsed */}
          <span className="text-sm font-semibold transition-opacity duration-200 group-data-[collapsible=icon]/sidebar-wrapper:opacity-0">
            Sketcho
          </span>
        </div>
      </SidebarHeader>

      {/* MAIN CONTENT */}
      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* Only show projects if available */}
        {(projects || []).length > 0 ? (
          <div className="transition-all duration-300">
            <NavProjects
              projects={data.projects}
            />
          </div>
        ) : (
          <div className="px-4 text-sm text-muted-foreground mt-2 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            No projects yet.
          </div>
        )}
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}