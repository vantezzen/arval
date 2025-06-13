import { create } from "zustand";
import Object from "../dto/Object";
import { Euler, Vector3 } from "three";

const EXAMPLE_OBJECTS = [
  new Object("bench", new Vector3(1, 0, 0), new Euler(), new Vector3(1, 1, 1)),
];

interface ObjectState {
  objects: Object[];
  editingObject: Object | null;

  addObject: (object: Object) => void;
  removeObject: (object: Object) => void;

  debugMessage?: string;
  setDebugMessage: (message?: string) => void;
}

export const useObjectStore = create<ObjectState>((set) => ({
  objects: EXAMPLE_OBJECTS,
  editingObject: EXAMPLE_OBJECTS[0],

  addObject: (object: Object) =>
    set((state) => {
      if (
        state.objects.some(
          (stateObject) => stateObject.objectId === object.objectId,
        )
      )
        return {};

      return {
        objects: [...state.objects, object],
      };
    }),
  removeObject: (object: Object) =>
    set((state) => {
      return {
        objects: state.objects.filter(
          (stateObject) => stateObject.objectId !== object.objectId,
        ),
        editingObject:
          state.editingObject?.objectId === object.objectId
            ? null
            : state.editingObject,
      };
    }),

  setDebugMessage: (message) => set({ debugMessage: message }),
}));
