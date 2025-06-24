import type Object from "../dto/Object";
import { injectable, inject } from "tsyringe";
import { TYPES } from "../di/types";
import type SizeService from "./SizeService";
import { useObjectStore } from "../stores/objectStore";
import type TagService from "./TagService";
import { Vector3 } from "three";
import polygonClipping from "polygon-clipping";

export type Intersection = {
  object: Object;
  intersectionArea: number;
  tags: string[];
};

@injectable()
export default class IntersectionService {
  constructor(
    @inject(TYPES.SizeService) private sizeService: SizeService,
    @inject(TYPES.TagService) private tagService: TagService
  ) {}

  async getIntersections(object: Object): Promise<Intersection[]> {
    const cornerPoints = await this.sizeService.getObjectCornerPoints(object);
    const otherObjects = useObjectStore
      .getState()
      .objects.filter((o) => o.id !== object.id);

    const intersections: Intersection[] = [];
    for (const otherObject of otherObjects) {
      const otherCornerPoints =
        await this.sizeService.getObjectCornerPoints(otherObject);

      console.log(
        `Calculating intersection for ${object.id} with ${otherObject.id}`,
        cornerPoints,
        otherCornerPoints
      );

      const intersectionArea = this.calculateIntersectionArea(
        cornerPoints,
        otherCornerPoints
      );

      if (intersectionArea > 0) {
        console.log("Intersection!", intersectionArea);
        const objectTags = this.tagService.getObjectTags(otherObject.type);
        intersections.push({
          object: otherObject,
          tags: objectTags,
          intersectionArea,
        });
      }
    }

    return intersections;
  }

  private calculateIntersectionArea(
    cornerPointsA: Vector3[],
    cornerPointsB: Vector3[]
  ): number {
    const polyA = cornerPointsA.map((p) => [p.x, p.z] as [number, number]);
    const polyB = cornerPointsB.map((p) => [p.x, p.z] as [number, number]);

    const intersection = polygonClipping.intersection([polyA], [polyB]);

    if (intersection.length === 0) {
      return 0;
    }

    // Calculate the area of the intersection polygon
    let area = 0;
    for (const polygon of intersection) {
      for (const ring of polygon) {
        // We only care about the outer ring for area calculation of simple polygons
        area += this.calculatePolygonArea(ring);
        break; // Only consider the outer ring
      }
    }

    return area;
  }

  private calculatePolygonArea(polygon: [number, number][]): number {
    let area = 0;
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += polygon[i][0] * polygon[j][1];
      area -= polygon[j][0] * polygon[i][1];
    }
    return Math.abs(area / 2);
  }
}
