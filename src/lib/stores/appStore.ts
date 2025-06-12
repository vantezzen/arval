import { create } from "zustand";
import type PositionProvider from "../position/PositionProvider";

interface AppState {
  xrEnabled: boolean;
  position: PositionProvider | null;

  update: (state: Partial<AppState>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  xrEnabled: false,
  position: null,

  update: set,
}));
