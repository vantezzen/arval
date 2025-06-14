import type Validation from "../Validation";
import DistanceToValidator from "./DistanceValidator";
import UndergroundValidator from "./UndergroundValidator";
import AreaValidator from "./AreaValidator";

export default function createValidators(validation: Validation) {
  return [
    new UndergroundValidator(validation),
    new DistanceToValidator(validation),
    new AreaValidator(validation),
  ];
}
