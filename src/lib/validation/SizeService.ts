import { Box3, Object3D, Quaternion, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type Object from "../dto/Object";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import OBJECTS from "../config/objects";
import { singleton } from "tsyringe";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

@singleton()
export default class SizeService {
  sizeCache = new Map<string, Vector3>();
  activeLoaders = new Map<string, Promise<Vector3>>();

  cornerPointsCache = new Map<string, Vector3[]>();

  async getRawObjectSize(modelUrl: string): Promise<Vector3> {
    if (this.sizeCache.has(modelUrl))
      return this.sizeCache.get(modelUrl)!.clone();

    if (this.activeLoaders.has(modelUrl)) {
      return await this.activeLoaders.get(modelUrl)!;
    }

    const loader = new Promise<Vector3>((resolve, reject) => {
      gltfLoader.load(
        modelUrl,
        (gltf) => {
          const box = new Box3().setFromObject(gltf.scene as Object3D);
          const size = new Vector3();
          box.getSize(size);
          this.sizeCache.set(modelUrl, size.clone());
          resolve(size);
        },
        undefined,
        (err) => reject(err)
      );
    });
    this.activeLoaders.set(modelUrl, loader);

    return loader;
  }

  private getObjectEdgePoints(baseSize: Vector3, object: Object): Vector3[] {
    const worldSize = baseSize.clone().multiply(object.scale);
    const half = worldSize.clone().multiplyScalar(0.5);

    // Local corner points on the XZ plane (Y ignored)
    const localCorners = [
      new Vector3(-half.x, 0, -half.z),
      new Vector3(half.x, 0, -half.z),
      new Vector3(half.x, 0, half.z),
      new Vector3(-half.x, 0, half.z),
    ];
    const q = new Quaternion().setFromEuler(object.rotation);

    return localCorners.map((p) => p.applyQuaternion(q).add(object.position));
  }

  async getObjectCornerPoints(object: Object): Promise<Vector3[]> {
    const cacheKey = this.getCacheKey(object);
    if (this.cornerPointsCache.has(cacheKey)) {
      return this.cornerPointsCache.get(cacheKey)!;
    }
    const baseSize = await this.getRawObjectSize(
      OBJECTS[object.type as keyof typeof OBJECTS].model
    );
    const cornerPoints = this.getObjectEdgePoints(baseSize, object);
    this.cornerPointsCache.set(cacheKey, cornerPoints);

    return cornerPoints;
  }

  private getCacheKey(object: Object): string {
    const approximatePosition = object.position
      .clone()
      .round()
      .multiplyScalar(100); // Round to 2 decimal places for better cache hit rate

    return `${object.id}-${object.type}-${approximatePosition.toArray().join(",")}-${object.rotation.toArray().join(",")}-${object.scale.toArray().join(",")}`;
  }
}
