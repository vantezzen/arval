import type Validation from "../Validation";
import UndergroundValidator from "./UndergroundValidator";

export default function createValidators(validation: Validation) {
  return [new UndergroundValidator(validation)];
}
