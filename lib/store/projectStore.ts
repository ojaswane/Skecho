// stores/projectStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabaseclient";
import { toast } from "react-hot-toast";

export const useProjectStore = create((set) => ({
  projects: [] as Array<any>,
  loading: false,

  // Fetch all projects for a user
  fetchProjects: async (userId: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ projects: data || [], loading: false });
    } catch (err: any) {
      console.error("Error fetching projects:", err.message);
      toast.error("Failed to fetch projects");
      set({ loading: false });
    }
  },

  // Add a new project
  addProject: async (project: any) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select();

      if (error) throw error;

      //  Add new project at the top of the list
      set((state: any) => ({
        projects: [data[0], ...state.projects],
      }));

      toast.success("Project added successfully");
    } catch (err: any) {
      console.error("Error adding project:", err.message);
      toast.error("Failed to add project");
    }
  },
}));