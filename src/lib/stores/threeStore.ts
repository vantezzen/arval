import type { RootState } from "@react-three/fiber";
import { create } from "zustand";

export type ThreeState = {
  update: (state: Partial<ThreeState>) => void;
  three?: RootState;
};

export const useThreeStore = create<ThreeState>((set) => ({
  update: set,
}));
