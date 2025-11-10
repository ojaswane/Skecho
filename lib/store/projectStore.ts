import { create } from "zustand"
import { supabase } from "@/lib/supabaseclient"

interface Project {
    id: string
    user_id: string
    name: string
    description?: string
    thumbnail_url?: string
    created_at: string
    updated_at: string
}

interface ProjectStore {
    projects: Project[]
    loading: boolean
    error: string | null

    // Actions
    fetchProjects: (userId: string) => Promise<void>
    addProject: (project: Omit<Project, "id" | "created_at" | "updated_at">) => Promise<Project>
    deleteProject: (id: string) => Promise<void>
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [],
    loading: false,
    error: null,

    fetchProjects: async (userId: string) => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
            if (error) throw error
            set({ projects: data || [], loading: false })
        } catch (err: any) {
            set({ error: err.message, loading: false })
        }
    },

    addProject: async (projectData: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project> => {
        try {
            const { data, error } = await supabase
                .from("projects")
                .insert([projectData])
                .select()
                .single<Project>()

            if (error) throw error

            set((state) => ({ projects: [data, ...state.projects] }))
            return data
        } catch (err: any) {
            set({ error: err.message })
            throw err
        }
    },

    deleteProject: async (projectId) => {
        try {
            if (!projectId) {
                console.error(" No project ID provided!");
                return;
            }

            const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", projectId);

            if (error) {
                console.error(" Delete failed:", error.message);
            } else {
                console.log(" Project deleted successfully");
            }
        } catch (err: any) {
            set({ error: err.message })
        }
    },

    updateProject: async (projectId, updates) => {
        try {
            const { data, error } = await supabase
                .from("projects")
                .update(updates)
                .eq("id", projectId)
                .select()
            if (error) throw error
            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId ? { ...p, ...data[0] } : p
                ),
            }))
        } catch (err: any) {
            set({ error: err.message })
        }
    },
}))