import EventEmitter from "events";
import type PositionProvider from "../PositionProvider";
import { Vector3 } from "three";
import RealPosition from "../../dto/RealPosition";

export default class VirtualPositionProvider
  extends EventEmitter
  implements PositionProvider
{
  convertRealToVirtualPosition(realPosition: RealPosition): Vector3 {
    return new Vector3(realPosition.latitude, 0, realPosition.longitude);
  }

  convertVirtualToRealPosition(virtualPosition: Vector3): RealPosition {
    return new RealPosition(virtualPosition.x, virtualPosition.z);
  }
}
