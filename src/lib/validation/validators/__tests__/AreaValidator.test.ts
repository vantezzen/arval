import { describe, it, expect, beforeEach } from "vitest";
import { container } from "tsyringe";
import { createTestObject, createAreaRule } from "@/test/utils/testUtils";
import AreaValidator from "../AreaValidator";
import type Object from "@/lib/dto/Object";
import { Vector3 } from "three";
import { MockSegmentationProvider } from "@/test/mocks/mockServices";

describe("AreaValidator", () => {
  let validator: AreaValidator;
  let mockSegmentationProvider: MockSegmentationProvider;

  beforeEach(() => {
    container.clearInstances();
    mockSegmentationProvider = new MockSegmentationProvider();
    container.registerInstance(
      "SegmentationProvider",
      mockSegmentationProvider
    );
    validator = container.resolve(AreaValidator);
  });

  describe("circle area", () => {
    const area = {
      type: "circle" as const,
      center: [0, 0] as [number, number],
      radius: 5,
    };

    it("should return false when object is inside circle", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Area validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });

    it("should return true when object is outside circle", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(10, 0, 10)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should return false when object is exactly on circle edge", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(5, 0, 0)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Area validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });
  });

  describe("bbox area", () => {
    const area = {
      type: "bbox" as const,
      coordinates: [0, 0, 10, 10] as number[],
    };

    it("should return false when object is inside bbox", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(5, 0, 5)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Area validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });

    it("should return true when object is outside bbox", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(15, 0, 15)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should return false when object is exactly on bbox edge", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Area validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });
  });

  describe("polygon area", () => {
    const area = {
      type: "polygon" as const,
      coordinates: [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ] as [number, number][],
    };

    it("should return false when object is inside polygon", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(5, 0, 5)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Area validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });

    it("should return true when object is outside polygon", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(15, 0, 15)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should return false when object is exactly on polygon edge", async () => {
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Area validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });
  });

  describe("edge cases", () => {
    it("should handle zero radius circle", async () => {
      const area = {
        type: "circle" as const,
        center: [0, 0] as [number, number],
        radius: 0,
      };
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Area validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });

    it("should handle empty polygon", async () => {
      const area = {
        type: "polygon" as const,
        coordinates: [] as [number, number][],
      };
      const rule = createAreaRule(area, "forbid", "Area validation rule");
      const object = createTestObject(
        "tree",
        new Vector3(5, 0, 5)
      ) as unknown as Object;

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });
  });
});
