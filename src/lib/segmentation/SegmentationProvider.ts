import type { GroundType } from "@/lib/types/world";
import type { Vector3 } from "three";

export default interface SegmentationProvider {
  getGroundTypeAtPosition(position: Vector3): GroundType;
}
