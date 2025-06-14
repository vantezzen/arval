import type Object from "../dto/Object";
import type SegmentationProvider from "../segmentation/SegmentationProvider";
import StaticSegmentationProvider from "../segmentation/static/StaticSegmentationProvider";
import type { Area } from "../types/area";
import ErrorMessage from "./ErrorMessage";
import Ground from "./Ground";
import Size from "./Size";
import ValidationRuleResolver from "./ValidationRuleResolver";
import createValidators from "./validators";
import TransformationValidator from "./validators/TransformationValidator";
import { setCustomData } from "r3f-perf";

export type ValidationResult = {
  errors: string[];
  highlightedAreas: Area[];
};

export default class Validation {
  public segmentation: SegmentationProvider = new StaticSegmentationProvider();
  public ground = new Ground(this);
  public validators = createValidators(this);
  public ruleResolver = new ValidationRuleResolver();
  public errorMessage = new ErrorMessage();
  public size = new Size();
  public transformation = new TransformationValidator(this);

  async validate(object: Object): Promise<ValidationResult> {
    const startTime = performance.now();
    const rules = this.ruleResolver.resolveRulesetForObject(object.objectType);

    const errors = (
      await Promise.all(
        // for every rule
        rules.placement
          .map((rule) =>
            // for every validator
            this.validators.map((validator) =>
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
