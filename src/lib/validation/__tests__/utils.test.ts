import { describe, it, expect } from "vitest";
import { isTagMatched, getUniqueAreas } from "../utils";
import type { Area } from "@/lib/types/area";

describe("utils", () => {
  describe("isTagMatched", () => {
    it("should return true when target tag is in object tag list", () => {
      const targetTags = ["grass", "tree"];
      const objectTags = ["tree", "building", "road"];

      const result = isTagMatched(targetTags, objectTags);

      expect(result).toBe(true);
    });

    it("should return false when no target tags match object tags", () => {
      const targetTags = ["grass", "water"];
      const objectTags = ["tree", "building", "road"];

      const result = isTagMatched(targetTags, objectTags);

      expect(result).toBe(false);
    });

    it("should return true when all target tags match", () => {
      const targetTags = ["grass", "tree"];
      const objectTags = ["grass", "tree", "building"];

      const result = isTagMatched(targetTags, objectTags);

      expect(result).toBe(true);
    });

    it("should return false when target tag list is empty", () => {
      const targetTags: string[] = [];
      const objectTags = ["tree", "building"];

      const result = isTagMatched(targetTags, objectTags);

      expect(result).toBe(false);
    });

    it("should return false when object tag list is empty", () => {
      const targetTags = ["grass", "tree"];
      const objectTags: string[] = [];

      const result = isTagMatched(targetTags, objectTags);

      expect(result).toBe(false);
    });

    it("should return false when both tag lists are empty", () => {
      const targetTags: string[] = [];
      const objectTags: string[] = [];

      const result = isTagMatched(targetTags, objectTags);

      expect(result).toBe(false);
    });

    it("should handle single tag matching", () => {
      const targetTags = ["grass"];
      const objectTags = ["grass", "tree"];

      const result = isTagMatched(targetTags, objectTags);

      expect(result).toBe(true);
    });

    it("should handle case-sensitive matching", () => {
      const targetTags = ["Grass", "Tree"];
      const objectTags = ["grass", "tree"];

      const result = isTagMatched(targetTags, objectTags);

      expect(result).toBe(false);
    });
  });

  describe("getUniqueAreas", () => {
    it("should return empty array for empty input", () => {
      const areas: Area[] = [];

      const result = getUniqueAreas(areas);

      expect(result).toEqual([]);
    });

    it("should return single area unchanged", () => {
      const areas: Area[] = [
        {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toEqual(areas);
    });

    it("should remove duplicate circle areas", () => {
      const areas: Area[] = [
        {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
        {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
        {
          type: "circle",
          center: [1, 1],
          radius: 3,
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(areas[0]);
      expect(result[1]).toEqual(areas[2]);
    });

    it("should remove duplicate bbox areas", () => {
      const areas: Area[] = [
        {
          type: "bbox",
          coordinates: [0, 0, 10, 10],
        },
        {
          type: "bbox",
          coordinates: [0, 0, 10, 10],
        },
        {
          type: "bbox",
          coordinates: [5, 5, 15, 15],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(areas[0]);
      expect(result[1]).toEqual(areas[2]);
    });

    it("should remove duplicate polygon areas", () => {
      const areas: Area[] = [
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        },
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        },
        {
          type: "polygon",
          coordinates: [
            [5, 5],
            [15, 5],
            [15, 15],
            [5, 15],
          ],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(areas[0]);
      expect(result[1]).toEqual(areas[2]);
    });

    it("should keep areas of different types", () => {
      const areas: Area[] = [
        {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
        {
          type: "bbox",
          coordinates: [0, 0, 10, 10],
        },
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toEqual(areas);
    });

    it("should handle circle areas with different centers", () => {
      const areas: Area[] = [
        {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
        {
          type: "circle",
          center: [1, 0],
          radius: 5,
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toEqual(areas);
    });

    it("should handle circle areas with different radii", () => {
      const areas: Area[] = [
        {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
        {
          type: "circle",
          center: [0, 0],
          radius: 3,
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toEqual(areas);
    });

    it("should handle bbox areas with different coordinates", () => {
      const areas: Area[] = [
        {
          type: "bbox",
          coordinates: [0, 0, 10, 10],
        },
        {
          type: "bbox",
          coordinates: [1, 1, 11, 11],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toEqual(areas);
    });

    it("should handle polygon areas with different coordinates", () => {
      const areas: Area[] = [
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        },
        {
          type: "polygon",
          coordinates: [
            [1, 1],
            [11, 1],
            [11, 11],
            [1, 11],
          ],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toEqual(areas);
    });

    it("should handle polygon areas with different number of coordinates", () => {
      const areas: Area[] = [
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        },
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
          ],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toEqual(areas);
    });

    it("should handle polygon areas with same coordinates in different order", () => {
      const areas: Area[] = [
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        },
        {
          type: "polygon",
          coordinates: [
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toEqual(areas);
    });

    it("should handle mixed duplicate and unique areas", () => {
      const areas: Area[] = [
        {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
        {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
        {
          type: "bbox",
          coordinates: [0, 0, 10, 10],
        },
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        },
        {
          type: "polygon",
          coordinates: [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(areas[0]);
      expect(result[1]).toEqual(areas[2]);
      expect(result[2]).toEqual(areas[3]);
    });

    it("should handle areas with floating point precision", () => {
      const areas: Area[] = [
        {
          type: "circle",
          center: [0.1, 0.2],
          radius: 5.5,
        },
        {
          type: "circle",
          center: [0.1, 0.2],
          radius: 5.5,
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(areas[0]);
    });

    it("should handle bbox areas with floating point coordinates", () => {
      const areas: Area[] = [
        {
          type: "bbox",
          coordinates: [0.1, 0.2, 10.3, 10.4],
        },
        {
          type: "bbox",
          coordinates: [0.1, 0.2, 10.3, 10.4],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(areas[0]);
    });

    it("should handle polygon areas with floating point coordinates", () => {
      const areas: Area[] = [
        {
          type: "polygon",
          coordinates: [
            [0.1, 0.2],
            [10.3, 0.4],
            [10.5, 10.6],
            [0.7, 10.8],
          ],
        },
        {
          type: "polygon",
          coordinates: [
            [0.1, 0.2],
            [10.3, 0.4],
            [10.5, 10.6],
            [0.7, 10.8],
          ],
        },
      ];

      const result = getUniqueAreas(areas);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(areas[0]);
    });
  });
});
