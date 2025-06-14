import { create } from "zustand";

interface AppState {
  xrEnabled: boolean;

  update: (state: Partial<AppState>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  xrEnabled: false,
  position: null,

  update: set,
}));
