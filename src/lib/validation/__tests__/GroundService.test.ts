import { describe, it, expect, beforeEach } from "vitest";
import { container } from "tsyringe";
import { createTestObject } from "@/test/utils/testUtils";
import GroundService from "../GroundService";
import {
  MockSegmentationProvider,
  MockSizeService,
} from "@/test/mocks/mockServices";
import type { GroundArea } from "@/lib/segmentation/SegmentationProvider";
import { GroundType } from "@/lib/types/world";
import { Vector3 } from "three";
import type Object from "@/lib/dto/Object";
import { TYPES } from "@/lib/di/types";

describe("GroundService", () => {
  let groundService: GroundService;
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
    groundService = container.resolve(GroundService);
  });

  describe("getGroundType", () => {
    it("should return ground areas for object corner points", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;
      const cornerPoints = [
        new Vector3(1, 0, 1),
        new Vector3(-1, 0, 1),
        new Vector3(-1, 0, -1),
        new Vector3(1, 0, -1),
      ];

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

      mockSizeService.setCornerPoints(object.id, cornerPoints);
      mockSegmentationProvider.setGroundAreas(groundAreas);

      const result = await groundService.getGroundType(object);

      expect(result).toHaveLength(4);
      result.forEach((area) => {
        expect(area).toEqual(groundAreas[0]);
      });
    });

    it("should filter out undefined ground areas", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;
      const cornerPoints = [
        new Vector3(1, 0, 1),
        new Vector3(-1, 0, 1),
        new Vector3(-1, 0, -1),
        new Vector3(1, 0, -1),
      ];

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

      mockSizeService.setCornerPoints(object.id, cornerPoints);
      mockSegmentationProvider.setGroundAreas(groundAreas);

      const result = await groundService.getGroundType(object);

      expect(result).toHaveLength(4);
      result.forEach((area) => {
        expect(area).toEqual(groundAreas[0]);
      });
    });

    it("should return empty array when no ground areas found", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;
      const cornerPoints = [
        new Vector3(10, 0, 10),
        new Vector3(11, 0, 10),
        new Vector3(11, 0, 11),
        new Vector3(10, 0, 11),
      ];

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

      mockSizeService.setCornerPoints(object.id, cornerPoints);
      mockSegmentationProvider.setGroundAreas(groundAreas);

      const result = await groundService.getGroundType(object);

      expect(result).toEqual([]);
    });

    it("should handle multiple ground areas for different corner points", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;
      const cornerPoints = [
        new Vector3(1, 0, 1),
        new Vector3(-1, 0, 1),
        new Vector3(-1, 0, -1),
        new Vector3(1, 0, -1),
      ];

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
        {
          type: GroundType.building,
          area: {
            type: "circle",
            center: [2, 2],
            radius: 3,
          },
          tags: ["asphalt"],
        },
      ];

      mockSizeService.setCornerPoints(object.id, cornerPoints);
      mockSegmentationProvider.setGroundAreas(groundAreas);

      const result = await groundService.getGroundType(object);

      expect(result).toHaveLength(4);
      result.forEach((area) => {
        expect(area).toEqual(groundAreas[0]);
      });
    });

    it("should handle object with no corner points", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;
      mockSizeService.setCornerPoints(object.id, []);

      const result = await groundService.getGroundType(object);

      expect(result).toEqual([]);
    });
  });
});
