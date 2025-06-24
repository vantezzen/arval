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
  bucket: {
    name: "Blumentopf",
    id: "bucket",
    model:
      "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/wood-bucket/model.gltf",
  },
  plant: {
    name: "Pflanze",
    id: "plant",
    model: "/models/plant.gltf",
  },
} as const;

export default OBJECTS;
