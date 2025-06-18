import type { ResolvedRule } from "@/lib/types/rules";
import Validator, { type PassResult } from "./Validator";
import z, { type ZodObject } from "zod/v4";
import type Object from "@/lib/dto/Object";
import { isTagMatched } from "../utils";
import { placementRule } from "@/lib/types/acs";
import type { GroundArea } from "@/lib/segmentation/SegmentationProvider";
import { injectable, inject } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import type GroundService from "../GroundService";

const undergroundRuleSchema = z.object({
  ...placementRule.shape,
  tags: z.string().array(),
});
type UndergroundRule = z.infer<typeof undergroundRuleSchema>;

@injectable()
export default class UndergroundValidator extends Validator<UndergroundRule> {
  constructor(
    @inject(TYPES.GroundService) private groundService: GroundService
  ) {
    super();
  }

  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "underground";
  }

  protected getRuleSchema(): ZodObject {
    return undergroundRuleSchema;
  }

  protected async passes(
    rule: UndergroundRule,
    object: Object
  ): Promise<PassResult> {
    const currentGroundTypes = await this.groundService.getGroundType(object);
    const mergedTags = [
      ...new Set(currentGroundTypes.map((ground) => ground.tags).flat()),
    ];

    return {
      passes: isTagMatched(rule.tags, mergedTags),
      highlightedAreas: this.getHighlightedAreas(currentGroundTypes, rule),
    };
  }

  private getHighlightedAreas(
    groundAreas: GroundArea[],
    rule: UndergroundRule
  ) {
    return groundAreas
      .filter((area) => isTagMatched(rule.tags, area.tags))
      .map((area) => area.area)
      .filter(Boolean);
  }
}
