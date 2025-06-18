import { describe, it, expect, beforeEach } from "vitest";
import { container } from "tsyringe";
import { createTestObject, createDistanceRule } from "@/test/utils/testUtils";
import DistanceValidator from "../DistanceValidator";
import type Object from "@/lib/dto/Object";
import { Vector3 } from "three";
import {
  MockSegmentationProvider,
  MockSizeService,
} from "@/test/mocks/mockServices";
import { TYPES } from "@/lib/di/types";

describe("DistanceValidator", () => {
  let validator: DistanceValidator;
  let mockSegmentationProvider: MockSegmentationProvider;
  let mockSizeService: MockSizeService;

  beforeEach(() => {
    container.clearInstances();
    mockSegmentationProvider = new MockSegmentationProvider();
    mockSizeService = new MockSizeService();
    container.registerInstance(
      TYPES.SegmentationService,
      mockSegmentationProvider
    );
    container.registerInstance(TYPES.SizeService, mockSizeService);
    validator = container.resolve(DistanceValidator);
  });

  describe("distance validation", () => {
    const area = {
      type: "circle" as const,
      center: [0, 0] as [number, number],
      radius: 5,
    };

    it("should return false when object is within distance", async () => {
      const rule = createDistanceRule(
        ["tree"],
        5,
        "forbid",
        "Distance validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the size service to return corner points
      mockSizeService.setCornerPoints(object.id, [
        new Vector3(2, 0, 2),
        new Vector3(3, 0, 2),
        new Vector3(3, 0, 3),
        new Vector3(2, 0, 3),
      ]);

      // Mock the segmentation provider to return an object within distance
      mockSegmentationProvider.setObjectsByTag("tree", [
        { position: new Vector3(0, 0, 0), area, distance: 2 },
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Distance validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });

    it("should return true when object is outside distance", async () => {
      const rule = createDistanceRule(
        ["tree"],
        5,
        "forbid",
        "Distance validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(10, 0, 10)
      ) as unknown as Object;

      // Mock the size service to return corner points
      mockSizeService.setCornerPoints(object.id, [
        new Vector3(10, 0, 10),
        new Vector3(11, 0, 10),
        new Vector3(11, 0, 11),
        new Vector3(10, 0, 11),
      ]);

      // Mock the segmentation provider to return an object outside distance
      mockSegmentationProvider.setObjectsByTag("tree", [
        { position: new Vector3(0, 0, 0), area, distance: 10 },
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should return true when object is exactly at distance boundary", async () => {
      const rule = createDistanceRule(
        ["tree"],
        5,
        "forbid",
        "Distance validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(5, 0, 0)
      ) as unknown as Object;

      // Mock the size service to return corner points
      mockSizeService.setCornerPoints(object.id, [
        new Vector3(5, 0, 0),
        new Vector3(6, 0, 0),
        new Vector3(6, 0, 1),
        new Vector3(5, 0, 1),
      ]);

      // Mock the segmentation provider to return an object at exact distance
      mockSegmentationProvider.setObjectsByTag("tree", [
        { position: new Vector3(0, 0, 0), area, distance: 5 },
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should return true when no objects found with specified tags", async () => {
      const rule = createDistanceRule(
        ["nonexistent"],
        5,
        "forbid",
        "Distance validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the size service to return corner points
      mockSizeService.setCornerPoints(object.id, [
        new Vector3(2, 0, 2),
        new Vector3(3, 0, 2),
        new Vector3(3, 0, 3),
        new Vector3(2, 0, 3),
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should handle multiple tags", async () => {
      const rule = createDistanceRule(
        ["tree", "building"],
        5,
        "forbid",
        "Distance validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the size service to return corner points
      mockSizeService.setCornerPoints(object.id, [
        new Vector3(2, 0, 2),
        new Vector3(3, 0, 2),
        new Vector3(3, 0, 3),
        new Vector3(2, 0, 3),
      ]);

      // Mock objects for both tags
      mockSegmentationProvider.setObjectsByTag("tree", [
        { position: new Vector3(0, 0, 0), area, distance: 10 },
      ]);
      mockSegmentationProvider.setObjectsByTag("building", [
        { position: new Vector3(0, 0, 0), area, distance: 2 },
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({
        error: {
          reason: "Distance validation rule",
          type: "atomic",
        },
        highlightedAreas: [area],
      });
    });
  });

  describe("edge cases", () => {
    it("should handle zero distance", async () => {
      const rule = createDistanceRule(
        ["tree"],
        0,
        "forbid",
        "Distance validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;

      // Mock the size service to return corner points
      mockSizeService.setCornerPoints(object.id, [
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(1, 0, 1),
        new Vector3(0, 0, 1),
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });

    it("should handle negative distance", async () => {
      const rule = createDistanceRule(
        ["tree"],
        -5,
        "forbid",
        "Distance validation rule"
      );
      const object = createTestObject(
        "tree",
        new Vector3(2, 0, 2)
      ) as unknown as Object;

      // Mock the size service to return corner points
      mockSizeService.setCornerPoints(object.id, [
        new Vector3(2, 0, 2),
        new Vector3(3, 0, 2),
        new Vector3(3, 0, 3),
        new Vector3(2, 0, 3),
      ]);

      const result = await validator.validate(rule, object);

      expect(result).toEqual({});
    });
  });
});
