import { Vector3 } from "three";
import type { Area, CircleArea } from "@/lib/types/area";
import type { GroundArea } from "@/lib/segmentation/SegmentationProvider";
import type { ResolvedRuleset } from "@/lib/types/rules";
import type SegmentationProvider from "@/lib/segmentation/SegmentationProvider";
import { MockObject } from "@/test/utils/testUtils";

export class MockSegmentationProvider implements SegmentationProvider {
  private groundAreas: GroundArea[] = [];
  private objectsByTag: Map<
    string,
    Array<{ position: Vector3; area: Area; distance: number }>
  > = new Map();

  setGroundAreas(areas: GroundArea[]) {
    this.groundAreas = areas;
  }

  setObjectsByTag(
    tag: string,
    objects: Array<{ position: Vector3; area: Area; distance: number }>
  ) {
    this.objectsByTag.set(tag, objects);
  }

  getGroundAreaAtPosition(position: Vector3): GroundArea | undefined {
    return this.groundAreas.find((area) => {
      if (area.area && area.area.type === "circle") {
        const circleArea = area.area as CircleArea;
        const distance = Math.sqrt(
          Math.pow(position.x - circleArea.center[0], 2) +
            Math.pow(position.z - circleArea.center[1], 2)
        );
        return distance <= circleArea.radius;
      }
      return false;
    });
  }

  getClosestObjectByTag(
    _position: Vector3,
    tags: string[]
  ): { area?: Area; distance: number } | undefined {
    let closest: { area?: Area; distance: number } | undefined = undefined;
    let minDistance = Infinity;

    for (const tag of tags) {
      const objects = this.objectsByTag.get(tag) || [];
      for (const obj of objects) {
        if (obj.distance < minDistance) {
          minDistance = obj.distance;
          closest = { area: obj.area, distance: obj.distance };
        }
      }
    }

    return closest;
  }
}

export class MockSizeService {
  private cornerPoints: Map<string, Vector3[]> = new Map();
  private sizes: Map<string, { width: number; height: number; depth: number }> =
    new Map();

  setCornerPoints(objectId: string, points: Vector3[]) {
    this.cornerPoints.set(objectId, points);
  }

  setSize(
    objectId: string,
    size: { width: number; height: number; depth: number }
  ) {
    this.sizes.set(objectId, size);
  }

  async getObjectCornerPoints(object: MockObject): Promise<Vector3[]> {
    return (
      this.cornerPoints.get(object.id) || [
        new Vector3(-0.5, 0, -0.5),
        new Vector3(0.5, 0, -0.5),
        new Vector3(0.5, 0, 0.5),
        new Vector3(-0.5, 0, 0.5),
      ]
    );
  }

  getObjectSize(object: MockObject): {
    width: number;
    height: number;
    depth: number;
  } {
    return this.sizes.get(object.id) || { width: 1, height: 1, depth: 1 };
  }
}

export class MockGroundService {
  private groundTypes: Map<string, GroundArea[]> = new Map();

  constructor() {}

  setGroundTypes(objectId: string, types: GroundArea[]) {
    this.groundTypes.set(objectId, types);
  }

  async getGroundType(object: MockObject): Promise<GroundArea[]> {
    return this.groundTypes.get(object.id) || [];
  }

  getGroundTagsForTypes(types: GroundArea[]): string[] {
    return types.flatMap((type) => type.tags);
  }
}

export class MockValidationRuleResolver {
  private rulesets: Map<string, ResolvedRuleset> = new Map();

  setRuleset(objectType: string, ruleset: ResolvedRuleset) {
    this.rulesets.set(objectType, ruleset);
  }

  resolveRulesetForObject(objectType: string): ResolvedRuleset {
    const ruleset = this.rulesets.get(objectType);
    if (!ruleset) {
      return {
        name: "default",
        tags: ["default"],
        scope: "object",
        transform: [],
        placement: [],
      };
    }
    return ruleset;
  }
}
