import { Box3, Object3D, Quaternion, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type Object from "../dto/Object";
import MODELS from "../config/models";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

export default class Size {
  sizeCache = new Map<string, Vector3>();
  activeLoaders = new Map<string, Promise<Vector3>>();

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
        (err) => reject(err),
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
    const baseSize = await this.getRawObjectSize(
      MODELS[object.objectType as keyof typeof MODELS],
    );
    const cornerPoints = this.getObjectEdgePoints(baseSize, object);
    return cornerPoints;
  }
}
