import { create } from "zustand";
import Object from "../dto/Object";

interface ObjectState {
  objects: Object[];
  editingObject: Object | null;

  addObject: (object: Object) => void;
  removeObject: (object: Object) => void;
  setEditingObject: (object: Object) => void;

  debugMessage?: string;
  setDebugMessage: (message?: string) => void;
}

export const useObjectStore = create<ObjectState>((set) => ({
  objects: [],
  editingObject: null,

  addObject: (object: Object) =>
    set((state) => {
      if (state.objects.some((stateObject) => stateObject.id === object.id))
        return {};

      return {
        objects: [...state.objects, object],
      };
    }),
  removeObject: (object: Object) =>
    set((state) => {
      return {
        objects: state.objects.filter(
          (stateObject) => stateObject.id !== object.id
        ),
        editingObject:
          state.editingObject?.id === object.id ? null : state.editingObject,
      };
    }),
  setEditingObject: (object: Object) => set({ editingObject: object }),

  setDebugMessage: (message) => set({ debugMessage: message }),
}));
