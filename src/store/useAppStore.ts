"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  showMasterList: boolean;
  toggleShowMasterList: () => void;
  userName: string;
  setUserName: (name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      showMasterList: false,
      toggleShowMasterList: () =>
        set((s) => ({ showMasterList: !s.showMasterList })),
      userName: "Lionel",
      setUserName: (name: string) => set({ userName: name }),
    }),
    { name: "elephant-settings" }
  )
);
