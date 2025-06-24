import DistanceToValidator from "./DistanceValidator";
import UndergroundValidator from "./UndergroundValidator";
import AreaValidator from "./AreaValidator";
import { container } from "tsyringe";
import IntersectionValidator from "./IntersectionValidator";

export default function createValidators() {
  return [
    container.resolve(UndergroundValidator),
    container.resolve(DistanceToValidator),
    container.resolve(AreaValidator),
    container.resolve(IntersectionValidator),
  ];
}
