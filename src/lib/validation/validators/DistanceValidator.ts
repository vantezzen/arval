import type { ResolvedRule } from "@/lib/types/rules";
import Validator, { type PassResult } from "./Validator";
import z, { type ZodObject } from "zod/v4";
import type Object from "@/lib/dto/Object";
import { placementRule } from "@/lib/types/acs";
import { injectable, inject } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import type SegmentationProvider from "@/lib/segmentation/SegmentationProvider";
import type SizeService from "../SizeService";

const distanceToRuleSchema = z.object({
  ...placementRule.shape,
  tags: z.string().array(),
  distance: z.number(),
});
type DistanceToRule = z.infer<typeof distanceToRuleSchema>;

@injectable()
export default class DistanceToValidator extends Validator<DistanceToRule> {
  constructor(
    @inject(TYPES.SegmentationService)
    private segmentation: SegmentationProvider,
    @inject(TYPES.SizeService) private sizeService: SizeService
  ) {
    super();
  }

  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "distanceTo";
  }

  protected getRuleSchema(): ZodObject {
    return distanceToRuleSchema;
  }

  protected async passes(
    rule: DistanceToRule,
    object: Object
  ): Promise<PassResult> {
    const cornerPoints = await this.sizeService.getObjectCornerPoints(object);
    const closestObject = cornerPoints
      .map((point) => this.segmentation.getClosestObjectByTag(point, rule.tags))
      .reduce((prev, curr) => {
        if (!curr) return prev;
        if (!prev || curr.distance < prev.distance) {
          return curr;
        }
        return prev;
      }, undefined);

    return {
      passes: !!closestObject && closestObject.distance < rule.distance,
      highlightedAreas: closestObject
        ? [closestObject.area].filter(Boolean)
        : [],
    };
  }
}
