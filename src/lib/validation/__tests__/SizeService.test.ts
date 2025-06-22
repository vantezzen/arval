import { describe, it, expect, beforeEach, vi } from "vitest";
import { container } from "tsyringe";
import { createTestObject } from "@/test/utils/testUtils";
import SizeService from "../SizeService";
import { Vector3, Euler, Box3, Object3D } from "three";
import type Object from "@/lib/dto/Object";

const mockDRACOLoader = vi.hoisted(() => ({
  setDecoderPath: vi.fn(),
}));

const mockGLTFLoader = vi.hoisted(() => ({
  setDRACOLoader: vi.fn(),
  load: vi.fn(),
}));

vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
  GLTFLoader: vi.fn().mockImplementation(() => mockGLTFLoader),
}));

vi.mock("three/examples/jsm/loaders/DRACOLoader.js", () => ({
  DRACOLoader: vi.fn().mockImplementation(() => mockDRACOLoader),
}));

describe("SizeService", () => {
  let sizeService: SizeService;

  beforeEach(() => {
    container.clearInstances();
    sizeService = container.resolve(SizeService);
    vi.clearAllMocks();
  });

  describe("getRawObjectSize", () => {
    it("should return cached size when available", async () => {
      const modelUrl = "test-model.glb";
      const cachedSize = new Vector3(2, 3, 4);

      sizeService.sizeCache.set(modelUrl, cachedSize);

      const result = await sizeService.getRawObjectSize(modelUrl);

      expect(result).toEqual(cachedSize.clone());
    });

    it("should return existing loader promise when loading", async () => {
      const modelUrl = "test-model.glb";
      const expectedSize = new Vector3(1, 2, 3);
      const loaderPromise = Promise.resolve(expectedSize);

      sizeService.activeLoaders.set(modelUrl, loaderPromise);

      const result = await sizeService.getRawObjectSize(modelUrl);

      expect(result).toEqual(expectedSize);
    });

    it("should load model and cache result", async () => {
      const modelUrl = "test-model.glb";
      const expectedSize = new Vector3(1, 2, 3);

      let loadCallback: ((gltf: any) => void) | undefined;
      mockGLTFLoader.load.mockImplementation(
        (url: string, onLoad: (gltf: any) => void) => {
          loadCallback = onLoad;
        }
      );

      const loadPromise = sizeService.getRawObjectSize(modelUrl);

      const mockScene = new Object3D();
      const mockBox = new Box3();
      mockBox.setFromObject(mockScene);
      const mockSize = new Vector3();
      mockBox.getSize(mockSize);
      mockSize.copy(expectedSize);

      vi.spyOn(Box3.prototype, "setFromObject").mockReturnValue(mockBox);
      vi.spyOn(mockBox, "getSize").mockImplementation((size) => {
        size.copy(expectedSize);
        return size;
      });

      if (loadCallback) {
        loadCallback({ scene: mockScene });
      }

      const result = await loadPromise;

      expect(result).toEqual(expectedSize);
      expect(sizeService.sizeCache.get(modelUrl)).toEqual(expectedSize);
    });

    it("should handle loader errors", async () => {
      const modelUrl = "test-model.glb";
      const error = new Error("Load failed");

      let errorCallback: ((error: Error) => void) | undefined;
      mockGLTFLoader.load.mockImplementation(
        (
          url: string,
          onLoad: any,
          onProgress: any,
          onError: (error: Error) => void
        ) => {
          errorCallback = onError;
        }
      );

      const loadPromise = sizeService.getRawObjectSize(modelUrl);

      if (errorCallback) {
        errorCallback(error);
      }

      await expect(loadPromise).rejects.toThrow("Load failed");
    });

    it("should handle multiple concurrent loads for same model", async () => {
      const modelUrl = "test-model.glb";
      const expectedSize = new Vector3(1, 2, 3);

      let loadCallback: ((gltf: any) => void) | undefined;
      mockGLTFLoader.load.mockImplementation(
        (url: string, onLoad: (gltf: any) => void) => {
          loadCallback = onLoad;
        }
      );

      const promise1 = sizeService.getRawObjectSize(modelUrl);
      const promise2 = sizeService.getRawObjectSize(modelUrl);

      const mockScene = new Object3D();
      const mockBox = new Box3();
      mockBox.setFromObject(mockScene);
      const mockSize = new Vector3();
      mockBox.getSize(mockSize);
      mockSize.copy(expectedSize);

      vi.spyOn(Box3.prototype, "setFromObject").mockReturnValue(mockBox);
      vi.spyOn(mockBox, "getSize").mockImplementation((size) => {
        size.copy(expectedSize);
        return size;
      });

      if (loadCallback) {
        loadCallback({ scene: mockScene });
      }

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual(expectedSize);
      expect(result2).toEqual(expectedSize);
      expect(sizeService.activeLoaders.has(modelUrl)).toBe(false);
    });
  });

  describe("getObjectCornerPoints", () => {
    function getTestCacheKey(object: any) {
      const approximatePosition = object.position
        .clone()
        .round()
        .multiplyScalar(100);
      return `${object.id}-${object.type}-${approximatePosition.toArray().join(",")}-${object.rotation.toArray().join(",")}-${object.scale.toArray().join(",")}`;
    }

    it("should return cached corner points when available", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(1, 0, 2)
      ) as unknown as Object;
      const cachedPoints = [
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(1, 0, 1),
        new Vector3(0, 0, 1),
      ];

      const cacheKey = getTestCacheKey(object);
      sizeService.cornerPointsCache.set(cacheKey, cachedPoints);

      const result = await sizeService.getObjectCornerPoints(object);

      expect(result).toEqual(cachedPoints);
    });

    it("should calculate and cache corner points", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(1, 0, 2)
      ) as unknown as Object;
      const baseSize = new Vector3(2, 3, 4);

      vi.spyOn(sizeService, "getRawObjectSize").mockResolvedValue(baseSize);

      const result = await sizeService.getObjectCornerPoints(object);

      expect(result).toHaveLength(4);
      const cacheKey = getTestCacheKey(object);
      expect(sizeService.cornerPointsCache.has(cacheKey)).toBe(true);
    });

    it("should calculate corner points with different scales", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;
      object.scale = new Vector3(2, 1, 3);
      const baseSize = new Vector3(1, 1, 1);

      vi.spyOn(sizeService, "getRawObjectSize").mockResolvedValue(baseSize);

      const result = await sizeService.getObjectCornerPoints(object);

      expect(result).toHaveLength(4);
      // The expected corners for scale (2,1,3) and baseSize (1,1,1):
      // (-1, 0, -1.5), (1, 0, -1.5), (1, 0, 1.5), (-1, 0, 1.5)
      const expectedPoints = [
        new Vector3(-1, 0, -1.5),
        new Vector3(1, 0, -1.5),
        new Vector3(1, 0, 1.5),
        new Vector3(-1, 0, 1.5),
      ];
      result.forEach((point, i) => {
        expect(point.x).toBeCloseTo(expectedPoints[i].x, 5);
        expect(point.z).toBeCloseTo(expectedPoints[i].z, 5);
      });
    });

    it("should calculate corner points with rotation", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(0, 0, 0)
      ) as unknown as Object;
      object.rotation = new Euler(0, Math.PI / 4, 0);
      const baseSize = new Vector3(2, 1, 2);

      vi.spyOn(sizeService, "getRawObjectSize").mockResolvedValue(baseSize);

      const result = await sizeService.getObjectCornerPoints(object);

      expect(result).toHaveLength(4);
    });

    it("should handle different object positions for caching", async () => {
      const object1 = createTestObject(
        "tree",
        new Vector3(1.123, 0, 2.456)
      ) as unknown as Object;
      const object2 = createTestObject(
        "tree",
        new Vector3(1.123, 0, 2.456)
      ) as unknown as Object;
      const baseSize = new Vector3(1, 1, 1);

      vi.spyOn(sizeService, "getRawObjectSize").mockResolvedValue(baseSize);

      const result1 = await sizeService.getObjectCornerPoints(object1);
      const result2 = await sizeService.getObjectCornerPoints(object2);

      expect(result1).toEqual(result2);
    });

    it("should handle different object positions with different cache keys", async () => {
      const object1 = createTestObject(
        "tree",
        new Vector3(1, 0, 2)
      ) as unknown as Object;
      const object2 = createTestObject(
        "tree",
        new Vector3(2, 0, 3)
      ) as unknown as Object;
      const baseSize = new Vector3(1, 1, 1);

      vi.spyOn(sizeService, "getRawObjectSize").mockResolvedValue(baseSize);

      const result1 = await sizeService.getObjectCornerPoints(object1);
      const result2 = await sizeService.getObjectCornerPoints(object2);

      expect(result1).not.toEqual(result2);
    });

    it("should handle objects with different properties in cache key", async () => {
      const object = createTestObject(
        "tree",
        new Vector3(1, 0, 2)
      ) as unknown as Object;
      object.rotation = new Euler(0, Math.PI / 4, 0);
      object.scale = new Vector3(2, 1, 3);
      const baseSize = new Vector3(1, 1, 1);

      vi.spyOn(sizeService, "getRawObjectSize").mockResolvedValue(baseSize);

      const result = await sizeService.getObjectCornerPoints(object);

      expect(result).toHaveLength(4);
    });
  });
});
