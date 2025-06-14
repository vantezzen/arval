import type { ResolvedRule } from "@/lib/types/rules";
import Validator from "./Validator";
import z, { type ZodObject } from "zod/v4";
import type Object from "@/lib/dto/Object";
import { isTagMatched } from "../utils";
import { placementRule } from "@/lib/types/acs";

const undergroundRuleSchema = z.object({
  ...placementRule.shape,
  tags: z.string().array(),
});
type UndergroundRule = z.infer<typeof undergroundRuleSchema>;

export default class UndergroundValidator extends Validator<UndergroundRule> {
  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "underground";
  }

  protected getRuleSchema(): ZodObject {
    return undergroundRuleSchema;
  }

  protected async passes(
    rule: UndergroundRule,
    object: Object,
  ): Promise<boolean> {
    const currentGroundTypes =
      await this.validation.ground.getGroundType(object);
    const groundTags =
      this.validation.ground.getGroundTagsForTypes(currentGroundTypes);

    return isTagMatched(rule.tags, groundTags);
  }
}
