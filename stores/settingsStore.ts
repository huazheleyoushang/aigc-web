"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDefaultModel, isModelAllowed } from "@/config/models";

interface SettingsState {
  model: string;
  sidebarCollapsed: boolean;
  setModel: (model: string) => void;
  toggleSidebarCollapsed: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      model: getDefaultModel().id,
      sidebarCollapsed: false,
      setModel: (model) => set({ model }),
      toggleSidebarCollapsed: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: "aigc_settings",
      onRehydrateStorage: () => (state) => {
        if (state && !isModelAllowed(state.model)) {
          state.model = getDefaultModel().id;
        }
      },
    },
  ),
);
