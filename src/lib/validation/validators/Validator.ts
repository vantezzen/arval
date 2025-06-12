import type { ResolvedRule } from "@/lib/types/rules";
import type Validation from "../Validation";
import type Object from "@/lib/dto/Object";
import type { Schema } from "zod";

export default abstract class Validator<T extends ResolvedRule> {
  constructor(private validation: Validation) {}

  /**
   * Indicate if this validator is responsible for validating this rule.
   * The rule may not contain any of the validator-specific elements so the rule type
   * is the generic "ResolvedRule" instead
   */
  abstract validatesRule(rule: ResolvedRule): boolean;

  /**
   * Validate that a rule contains all required elements using Zod
   */
  abstract getRuleSchema(): Schema;

  /**
   * Validate a rule against an object
   */
  abstract validate(rule: T, object: Object): boolean;
}
