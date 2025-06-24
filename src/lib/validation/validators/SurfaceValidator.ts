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

const surfaceRuleSchema = z.object({
  ...placementRule.shape,
  tags: z.string().array(),
  type: z.literal("full").optional(),
});
type SurfaceRule = z.infer<typeof surfaceRuleSchema>;

@injectable()
export default class SurfaceValidator extends Validator<SurfaceRule> {
  constructor(
    @inject(TYPES.GroundService) private groundService: GroundService
  ) {
    super();
  }

  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "surface";
  }

  protected getRuleSchema(): ZodObject {
    return surfaceRuleSchema;
  }

  protected async passes(
    rule: SurfaceRule,
    object: Object
  ): Promise<PassResult> {
    const currentGroundTypes = await this.groundService.getGroundType(object);
    console.debug(
      "SurfaceValidator: currentGroundTypes",
      currentGroundTypes,
      object.position
    );

    if (rule.type === "full") {
      // If the rule is of type "full", we check if *all* objects match the tags
      const isFullMatch = currentGroundTypes.every((ground) =>
        isTagMatched(rule.tags, ground.tags)
      );
      return {
        passes: isFullMatch,
        highlightedAreas: this.getHighlightedAreas(currentGroundTypes, rule),
      };
    }

    const mergedTags = [
      ...new Set(currentGroundTypes.map((ground) => ground.tags).flat()),
    ];

    return {
      passes: isTagMatched(rule.tags, mergedTags),
      highlightedAreas: this.getHighlightedAreas(currentGroundTypes, rule),
    };
  }

  private getHighlightedAreas(groundAreas: GroundArea[], rule: SurfaceRule) {
    return groundAreas
      .filter((area) => isTagMatched(rule.tags, area.tags))
      .map((area) => area.area)
      .filter(Boolean);
  }
}
