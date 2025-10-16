//This will store and sync the supabase data for all over the app
import { create } from "zustand"
import {supabase} from '@/lib/supabaseclient'
import {toast } from 'react-hot-toast'

type userStore = {
  user: {
    id: string | null
    name: string | null
    email: string | null
    // Todo: while i add sub logic do this too
    // credits: number | null
  } | null
  loading: boolean
  setUser: (userData: any) => void
  fetchUser: () => Promise<void>
  clearUser: () => void
}
export const useUserStore = create<userStore>((set) => ({
    user : null,
    loading : false,

      setUser: (userData) => set({ user: userData }),
       clearUser: () => set({ user: null }),

       fetchUser: async () => {
        set({ loading: true });
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error.message);
          toast.error("Error fetching user data");
          set({ loading: false });
          return;
        }

        if (data?.user) {
          const userData = {
            id: data.user.id,
            name: data.user.user_metadata.full_name || null,
            email: data.user.email || null,
            // credits: data.user.user_metadata.credits || null, // Example if you have credits in metadata
          };
          toast.success("User data fetched successfully");
          set({ user: userData });
        }
        set({loading: false});
       },

       Logout : async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out:", error.message);
          toast.error("Error signing out");
          return;
        }
        toast.success("Signed out successfully");
        set({ user: null });
       }
}))