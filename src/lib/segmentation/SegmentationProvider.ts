import type { GroundType } from "@/lib/types/world";
import type { Vector3 } from "three";
import type { Area } from "../types/area";

export type GroundArea = {
  type: GroundType;
  area?: Area;
  tags: string[];
};

export default interface SegmentationProvider {
  getGroundAreaAtPosition(position: Vector3): GroundArea | undefined;
  getDistanceToTag(
    position: Vector3,
    tags: string[],
    maxDistance?: number,
  ): number;
}
