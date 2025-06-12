import { Euler, Vector3 } from "three";
import { create } from "zustand";

interface ObjectTransformState {
  objectPosition: Vector3;
  objectRotation: Euler;
  objectScale: Vector3;

  setObjectPosition: (position: Vector3) => void;
  setObjectRotation: (rotation: Euler) => void;
  setObjectScale: (scale: Vector3) => void;

  debugMessage?: string;
  setDebugMessage: (message?: string) => void;
}

export const useObjectTransformStore = create<ObjectTransformState>((set) => ({
  objectPosition: new Vector3(),
  objectRotation: new Euler(),
  objectScale: new Vector3(1, 1, 1),

  setDebugMessage: (message) => set({ debugMessage: message }),

  setObjectPosition: (position) => set({ objectPosition: position }),
  setObjectRotation: (rotation) => set({ objectRotation: rotation }),
  setObjectScale: (scale) => set({ objectScale: scale }),
}));
