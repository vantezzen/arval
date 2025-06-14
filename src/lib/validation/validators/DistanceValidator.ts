import type { ResolvedRule } from "@/lib/types/rules";
import Validator from "./Validator";
import z, { type ZodObject } from "zod/v4";
import type Object from "@/lib/dto/Object";
import { placementRule } from "@/lib/types/acs";

const distanceToRuleSchema = z.object({
  ...placementRule.shape,
  tags: z.string().array(),
  distance: z.number(),
});
type DistanceToRule = z.infer<typeof distanceToRuleSchema>;

export default class DistanceToValidator extends Validator<DistanceToRule> {
  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "distanceTo";
  }

  protected getRuleSchema(): ZodObject {
    return distanceToRuleSchema;
  }

  protected async passes(
    rule: DistanceToRule,
    object: Object,
  ): Promise<boolean> {
    const cornerPoints =
      await this.validation.size.getObjectCornerPoints(object);
    const distance = Math.min(
      ...cornerPoints.map((point) =>
        this.validation.segmentation.getDistanceToTag(point, rule.tags),
      ),
    );

    return distance < rule.distance;
  }
}
