import { GlobalRulesets, ObjectRulesets } from "../config/rulesets";
import type { ResolvedRuleset } from "../types/rules";
import type { ConstraintSet } from "../types/schemas/acs.schema";
import { mergeUnique } from "../utils";
import { isTagMatched } from "./utils";
import { injectable } from "tsyringe";

/**
 * ValidationRuleResolver: Resolve all rules that belong to an object (local and global)
 */
@injectable()
export default class ValidationRuleResolver {
  /**
   * Resolve all rule and object definitions for an object
   *
   * @param objectType Type ID for the object to resolve
   * @returns ResolvedRuleset All rules and object information for this object
   */
  resolveRulesetForObject(objectType: string): ResolvedRuleset {
    const directRulesets = this.resolveDirectRulesetsForObject(
      objectType
    ) as ResolvedRuleset;
    const globalRules = this.resolveGlobalRulesForTags(directRulesets.tags);
    directRulesets.placement = [...directRulesets.placement, ...globalRules];
    return directRulesets;
  }

  private resolveDirectRulesetsForObject(objectType: string) {
    const rulesets = ObjectRulesets[objectType];
    if (!rulesets) {
      throw new Error(`Cannot find any rulesets for object "${objectType}."`);
    }

    const combinedRuleset: ConstraintSet = rulesets.reduce(
      (currentRuleset, newRuleset) => ({
        name: newRuleset.name,
        tags: mergeUnique(currentRuleset.tags, newRuleset.tags) as [
          string,
          ...string[],
        ],
        scope: "object",

        transform: [
          ...(currentRuleset.transform ?? []),
          ...newRuleset.transform,
        ],
        placement: [
          ...(currentRuleset.placement ?? []),
          ...newRuleset.placement,
        ],
      }),
      {} as ConstraintSet
    );

    return combinedRuleset;
  }

  private resolveGlobalRulesForTags(tags: string[]) {
    const globalRules = GlobalRulesets.map((ruleset) => ruleset.rules).flat();

    return globalRules.filter((rule) =>
      // Rules that don't have "appliesToTags" set apply to all objects instead
      rule.appliesToTags ? isTagMatched(rule.appliesToTags, tags) : true
    );
  }
}
