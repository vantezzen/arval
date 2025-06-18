import type Object from "@/lib/dto/Object";
import type { ResolvedRuleset } from "@/lib/types/rules";
import type { ValidationCheckResult } from "@/lib/types/validation";
import type Validator from "./validators/Validator";
import { injectable } from "tsyringe";
import createValidators from "./validators";

@injectable()
export default class ValidationExecutor {
  constructor() {}

  /**
   * Executes all validations for an object against its rules.
   * This method runs all validators against all rules to collect all validation errors.
   *
   * @param object - The object to validate
   * @param rules - The resolved ruleset for the object
   * @returns Promise<ValidationCheckResult[]> - Array of validation results
   */
  async execute(
    object: Object,
    rules: ResolvedRuleset
  ): Promise<ValidationCheckResult[]> {
    const validators = createValidators();

    const validationPromises = this.createValidationPromises(
      object,
      rules,
      validators
    );
    const results = await Promise.all(validationPromises);

    return results;
  }

  /**
   * Creates validation promises for all rule-validator combinations.
   * This ensures we check all possible validation scenarios.
   *
   * @param object - The object to validate
   * @param rules - The resolved ruleset
   * @param validators - Array of available validators
   * @returns Promise<ValidationCheckResult>[] - Array of validation promises
   */
  private createValidationPromises(
    object: Object,
    rules: ResolvedRuleset,
    validators: Validator<any>[]
  ): Promise<ValidationCheckResult>[] {
    return rules.placement.flatMap((rule) =>
      validators.map((validator) => validator.validate(rule, object))
    );
  }
}
