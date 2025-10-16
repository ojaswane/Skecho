import { create } from "zustand";

// TypeScript interface (optional, for clarity)
interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  price: number;
  start_date: string; // or Date
  end_date: string;   // or Date
  status: "active" | "inactive" | "cancelled";
}

interface SubscriptionStore {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchSubscriptions: (userId: string) => Promise<void>;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, data: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  loading: false,
  error: null,

  fetchSubscriptions: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/subscriptions?userId=${userId}`);
      const data: Subscription[] = await res.json();
      set({ subscriptions: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch subscriptions", loading: false });
    }
  },

  addSubscription: (subscription) => {
    set((state) => ({ subscriptions: [...state.subscriptions, subscription] }));
  },

  updateSubscription: (id, data) => {
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...data } : sub
      ),
    }));
  },

  removeSubscription: (id) => {
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    }));
  },
}));
