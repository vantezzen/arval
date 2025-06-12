import type { Vector3 } from "three";
import type RealPosition from "../dto/RealPosition";

export default interface PositionProvider {
  convertVirtualToRealPosition(virtualPosition: Vector3): RealPosition;
  convertRealToVirtualPosition(realPosition: RealPosition): Vector3;
}
