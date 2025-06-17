import type { GroundType } from "@/lib/types/world";
import type { Vector3 } from "three";
import type { Area } from "../types/area";

export type GroundArea = {
  type: GroundType;
  area?: Area;
  tags: string[];
};

export type ClosestObject = {
  distance: number;
  area?: Area;
};

export default interface SegmentationProvider {
  getGroundAreaAtPosition(position: Vector3): GroundArea | undefined;
  getClosestObjectByTag(
    position: Vector3,
    tags: string[]
  ): ClosestObject | undefined;
}
