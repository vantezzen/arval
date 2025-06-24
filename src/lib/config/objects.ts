const OBJECTS = {
  bench: {
    name: "Sitzbank",
    id: "bench",
    model:
      "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bench-2/model.gltf",
  },
  zebraCrossing: {
    name: "Zebrastreifen",
    id: "zebraCrossing",
    model: "/models/zebra-crossing.gltf",
  },
  plantBucket: {
    name: "Blumentopf",
    id: "plantBucket",
    model:
      "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/wood-bucket/model.gltf",
  },
  tree: {
    name: "Baum",
    id: "tree",
    model:
      "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-beech/model.gltf",
  },
} as const;

export default OBJECTS;
