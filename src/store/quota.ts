import { create } from "zustand";
import { api } from "@/lib/api";

export interface QuotaState {
  credits_used: number;
  credits_limit: number;
  credits_remaining: number;
  exams_used: number;
  exams_limit: number;
  exams_remaining: number;
  corrections_used: number;
  corrections_limit: number;
  corrections_remaining: number;
  is_unlimited: boolean;
  loaded: boolean;
}

interface QuotaStore extends QuotaState {
  fetchQuota: () => Promise<void>;
  showPaywall: boolean;
  paywallReason: "exam" | "correction" | null;
  openPaywall: (reason: "exam" | "correction") => void;
  closePaywall: () => void;
}

export const useQuotaStore = create<QuotaStore>((set) => ({
  credits_used: 0,
  credits_limit: 3,
  credits_remaining: 3,
  exams_used: 0,
  exams_limit: 10,
  exams_remaining: 10,
  corrections_used: 0,
  corrections_limit: 10,
  corrections_remaining: 10,
  is_unlimited: false,
  loaded: false,

  showPaywall: false,
  paywallReason: null,

  fetchQuota: async () => {
    try {
      const { data } = await api.get<QuotaState>("/subscriptions/quota");
      set({ ...data, loaded: true });
    } catch {
      // ignore — pas critique si le backend ne répond pas
    }
  },

  openPaywall: (reason) => set({ showPaywall: true, paywallReason: reason }),
  closePaywall: () => set({ showPaywall: false, paywallReason: null }),
}));
