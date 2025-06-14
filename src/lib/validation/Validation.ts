import type Object from "../dto/Object";
import type { Area } from "../types/area";
import ValidationRuleResolver from "./ValidationRuleResolver";
import { setCustomData } from "r3f-perf";
import { singleton, inject, injectable, container } from "tsyringe";
import type Validator from "./validators/Validator";
import { TYPES } from "../di/types";
import type ErrorMessageService from "./ErrorMessageService";

export type ValidationResult = {
  errors: string[];
  highlightedAreas: Area[];
};

@singleton()
@injectable()
export default class Validation {
  constructor(
    @inject(TYPES.ValidationRuleResolver)
    public ruleResolver: ValidationRuleResolver,
    @inject(TYPES.ErrorMessageService) public errorMessage: ErrorMessageService,
  ) {}

  async validate(object: Object): Promise<ValidationResult> {
    // We cannot get the validators directly via the constructor as that would create
    // an infinite loop in the dependency resolve process
    const validators = container.resolve<Validator<any>[]>(TYPES.Validators);
    const startTime = performance.now();
    const rules = this.ruleResolver.resolveRulesetForObject(object.objectType);

    const errors = (
      await Promise.all(
        // for every rule
        rules.placement
          .map((rule) =>
            // for every validator
            validators.map((validator) =>
              // Run the validation
              validator.validate(rule, object),
            ),
          )
          .flat(),
      )
    ).flat();

    const result = {
      errors: this.errorMessage.createErrorMessage(
        errors.map((error) => error.error).filter(Boolean),
      ),
      highlightedAreas: errors
        .map((error) => error.highlightedAreas)
        .filter(Boolean)
        .flat(),
    };

    const runtime = performance.now() - startTime;
    setCustomData(runtime);

    return result;
  }
}
