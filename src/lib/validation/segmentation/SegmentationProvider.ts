import type { GroundType } from "@/lib/types/world";
import type { Vector3 } from "three";

export default abstract class SegmentationProvider {
  abstract getGroundTypeAtPosition(position: Vector3): GroundType;
}
