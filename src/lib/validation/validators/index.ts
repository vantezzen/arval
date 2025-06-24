import DistanceToValidator from "./DistanceValidator";
import SurfaceValidator from "./SurfaceValidator";
import AreaValidator from "./AreaValidator";
import { container } from "tsyringe";
import IntersectionValidator from "./IntersectionValidator";

export default function createValidators() {
  return [
    container.resolve(SurfaceValidator),
    container.resolve(DistanceToValidator),
    container.resolve(AreaValidator),
    container.resolve(IntersectionValidator),
  ];
}
