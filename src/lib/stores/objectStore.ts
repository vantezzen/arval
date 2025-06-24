import { create } from "zustand";
import Object from "../dto/Object";
import { Euler, Vector3 } from "three";

const EXAMPLE_OBJECTS = [
  new Object(
    "zebraCrossing",
    new Vector3(1, 0, 0),
    new Euler(),
    new Vector3(0.75, 0.75, 0.75)
  ),
  new Object("bench", new Vector3(1, 0, 5), new Euler(), new Vector3(1, 1, 1)),
  // new Object("tree", new Vector3(2, 0, 2), new Euler(), new Vector3(1, 1, 1)),
];

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
  objects: EXAMPLE_OBJECTS,
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
