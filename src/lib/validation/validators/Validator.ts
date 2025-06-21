import type { ResolvedRule } from "@/lib/types/rules";
import type Object from "@/lib/dto/Object";
import type { ZodObject } from "zod/v4";
import type {
  ValidationCheckResult,
  ValidationPassResult,
} from "@/lib/types/validation";

export type PassResult = ValidationPassResult;

export default abstract class Validator<T extends ResolvedRule> {
  protected ruleValidationResult: Map<ResolvedRule, boolean> = new Map();

  /**
   * Indicate if this validator is responsible for validating this rule.
   * The rule may not contain any of the validator-specific elements so the rule type
   * is the generic "ResolvedRule" instead
   */
  protected abstract validatesRule(rule: ResolvedRule): boolean;

  /**
   * Validate that a rule contains all required elements using Zod
   */
  protected abstract getRuleSchema(): ZodObject;

  /**
   * Validate a rule against an object
   */
  protected abstract passes(
    rule: T,
    object: Object
  ): Promise<ValidationPassResult>;

  public async validate(
    rule: ResolvedRule,
    object: Object
  ): Promise<ValidationCheckResult> {
    if (!this.validatesRule(rule)) {
      return {};
    }

    if (!this.ruleValidationResult.has(rule)) {
      const schema = this.getRuleSchema();
      const parsedSchema = schema.safeParse(rule);
      this.ruleValidationResult.set(rule, parsedSchema.success);
      if (!parsedSchema.success) {
        console.warn("Invalid Rule definition", rule, parsedSchema.error);

        return {};
      }
    }

    const { passes: isCheckPassed, highlightedAreas } = await this.passes(
      rule as T,
      object
    );
    const isFulfilled = this.isRuleFulfilled(rule, isCheckPassed);
    if (!isFulfilled) {
      return {
        error: {
          reason: rule.reason,
          type: rule.reasonType ?? "atomic",
        },
        highlightedAreas,
      };
    }
    return {};
  }

  /**
   * Check if the rule is fulfilled.
   * This should be provided if the underlying validation check is passed and returns
   * the rule result.
   * e.g. if the check itself passed but the action is "forbid", the rule is not fulfilled
   *
   * @param rule Rule that is being checked
   * @param isCheckPassed Status of the validation check
   * @returns True if the rule is fulfilled
   */
  protected isRuleFulfilled(rule: ResolvedRule, isCheckPassed: boolean) {
    if (rule.action === "forbid") {
      return !isCheckPassed;
    }
    return isCheckPassed;
  }
}
