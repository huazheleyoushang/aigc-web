"use client";

import { create } from "zustand";

interface ChatRuntimeState {
  isGenerating: boolean;
  abortController: AbortController | null;
  error: string | null;
  setGenerating: (value: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useChatRuntimeStore = create<ChatRuntimeState>((set) => ({
  isGenerating: false,
  abortController: null,
  error: null,
  setGenerating: (isGenerating) => set({ isGenerating }),
  setAbortController: (abortController) => set({ abortController }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ isGenerating: false, abortController: null, error: null }),
}));
