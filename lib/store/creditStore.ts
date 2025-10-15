// // Add this when i set up sub

// // lib/store/creditStore.ts
// import { create } from 'zustand'
// import { supabase } from '@/lib/supabaseclient'

// type CreditState = {
//   credits: number
//   loading: boolean
//   setCredits: (credits: number) => void
//   deductCredit: (amount: number) => void
//   fetchCredits: (userId: string) => Promise<void>
// }

// export const useCreditStore = create<CreditState>((set) => ({
//   credits: 0,
//   loading: false,

//   setCredits: (credits) => set({ credits }),

//   deductCredit: (amount) =>
//     set((state) => ({
//       credits: Math.max(0, state.credits - amount),
//     })),

//   fetchCredits: async (userId) => {
//     set({ loading: true })
//     const { data, error } = await supabase
//       .from("profiles") // assume you store credits in `profiles` table
//       .select("credits")
//       .eq("id", userId)
//       .single()

//     if (error) {
//       console.error("Error fetching credits:", error.message)
//       set({ loading: false })
//       return
//     }

//     set({ credits: data?.credits ?? 0, loading: false })
//   },
// }))
