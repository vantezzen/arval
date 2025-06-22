import { create } from "zustand";

export enum CreativityLevel {
  STRICT = 0,
  WARN = 1,
  PLAY = 2,
  CREATIVE = 3,
}

export type CreativityState = {
  update: (state: Partial<CreativityState>) => void;
  creativityLevel: CreativityLevel;
};

export const useCreativityStore = create<CreativityState>((set) => ({
  update: set,
  creativityLevel: CreativityLevel.STRICT as CreativityLevel,
}));
