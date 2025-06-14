import type Object from "../dto/Object";
import type SegmentationProvider from "../segmentation/SegmentationProvider";
import StaticSegmentationProvider from "../segmentation/static/StaticSegmentationProvider";
import type { ValidationError } from "../types/interface";
import ErrorMessage from "./ErrorMessage";
import Ground from "./Ground";
import Size from "./Size";
import ValidationRuleResolver from "./ValidationRuleResolver";
import createValidators from "./validators";

export default class Validation {
  public segmentation: SegmentationProvider = new StaticSegmentationProvider();
  public ground = new Ground(this);
  public validators = createValidators(this);
  public ruleResolver = new ValidationRuleResolver();
  public errorMessage = new ErrorMessage();
  public size = new Size();

  async validate(object: Object) {
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

    return this.errorMessage.createErrorMessage(
      errors.map((error) => error.error).filter(Boolean) as ValidationError[],
    );
  }
}
