"use client";

import { create } from "zustand";

export const GUEST_USER_ID = "guest";

interface GuestState {
  isGuest: boolean;
  enterGuest: () => void;
  exitGuest: () => void;
}

export const useGuestStore = create<GuestState>()((set) => ({
  isGuest: true, // 默认游客模式
  enterGuest: () => set({ isGuest: true }),
  exitGuest: () => set({ isGuest: false }),
}));
