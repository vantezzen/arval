import { create } from "zustand";
import type Validation from "../validation/Validation";

interface AppState {
  xrEnabled: boolean;
  validation: Validation;

  update: (state: Partial<AppState>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  xrEnabled: false,
  position: null,

  // @ts-expect-error Validation Engine is set before rendering App
  validation: null,

  update: set,
}));
