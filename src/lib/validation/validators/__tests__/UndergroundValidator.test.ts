import { describe, it, expect, beforeEach } from "vitest";
import { container } from "tsyringe";
import {
  createTestObject,
  createUndergroundRule,
} from "@/test/utils/testUtils";
import UndergroundValidator from "../UndergroundValidator";
import type Object from "@/lib/dto/Object";
import { Vector3 } from "three";
import {
  MockSegmentationProvider,
  MockGroundService,
} from "@/test/mocks/mockServices";
import type { GroundArea } from "@/lib/segmentation/SegmentationProvider";
import { GroundType } from "@/lib/types/world";

describe("UndergroundValidator", () => {
  let validator: UndergroundValidator;
  let mockSegmentationProvider: MockSegmentationProvider;
  let mockGroundService: MockGroundService;

  beforeEach(() => {
    container.clearInstances();
    mockSegmentationProvider = new MockSegmentationProvider();
    mockGroundService = new MockGroundService();
    container.registerInstance(
      "SegmentationProvider",
      mockSegmentationProvider
    );
    container.registerInstance("GroundService", mockGroundService);
    validator = container.resolve(UndergroundValidator);
  });

  describe("underground validation", () => {
    const groundAreas: GroundArea[] = [
      {
        type: GroundType.grass,
        area: {
          type: "circle",
          center: [0, 0],
          radius: 5,
        },
        tags: ["grass"],
      },
    ];

    it("should return false when ground type matches", async () => {
      const rule = createUndergroundRule(
        ["grass"],
        "forbid",
        "Underground validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the ground service to return matching ground types
      mockGroundService.setGroundTypes(object.id, groundAreas);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Underground validation rule",
          type: "atomic",
        },
        highlightedAreas: [groundAreas[0].area],
      });
    });

    it("should return true when ground type does not match", async () => {
      const rule = createUndergroundRule(
        ["grass"],
        "forbid",
        "Underground validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(10, 0, 10)
      ) as unknown as Object;

      // Mock the ground service to return non-matching ground types
      mockGroundService.setGroundTypes(object.id, [
        {
          type: GroundType.building,
          area: {
            type: "circle",
            center: [0, 0],
            radius: 5,
          },
          tags: ["asphalt"],
        },
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should return true when no ground types found", async () => {
      const rule = createUndergroundRule(
        ["grass"],
        "forbid",
        "Underground validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the ground service to return no ground types
      mockGroundService.setGroundTypes(object.id, []);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should handle multiple ground tags", async () => {
      const rule = createUndergroundRule(
        ["grass", "dirt"],
        "forbid",
        "Underground validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the ground service to return matching ground types
      mockGroundService.setGroundTypes(object.id, [
        {
          type: GroundType.grass,
          area: {
            type: "circle",
            center: [0, 0],
            radius: 5,
          },
          tags: ["grass", "dirt"],
        },
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Underground validation rule",
          type: "atomic",
        },
        highlightedAreas: [groundAreas[0].area],
      });
    });

    it("should handle partial tag matches", async () => {
      const rule = createUndergroundRule(
        ["grass", "dirt"],
        "forbid",
        "Underground validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the ground service to return partial matching ground types
      mockGroundService.setGroundTypes(object.id, [
        {
          type: GroundType.grass,
          area: {
            type: "circle",
            center: [0, 0],
            radius: 5,
          },
          tags: ["grass"],
        },
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Underground validation rule",
          type: "atomic",
        },
        highlightedAreas: [groundAreas[0].area],
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty tag list", async () => {
      const rule = createUndergroundRule(
        [],
        "forbid",
        "Underground validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should handle ground areas without tags", async () => {
      const rule = createUndergroundRule(
        ["grass"],
        "forbid",
        "Underground validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the ground service to return ground areas without tags
      mockGroundService.setGroundTypes(object.id, [
        {
          type: GroundType.grass,
          area: {
            type: "circle",
            center: [0, 0],
            radius: 5,
          },
          tags: [],
        },
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });
  });
});
