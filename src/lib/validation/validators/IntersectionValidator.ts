import type { ResolvedRule } from "@/lib/types/rules";
import Validator, { type PassResult } from "./Validator";
import z, { type ZodObject } from "zod/v4";
import type Object from "@/lib/dto/Object";
import { placementRule } from "@/lib/types/acs";
import { injectable, inject } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import type IntersectionService from "../IntersectionService";

const IntersectionRuleSchema = z.object({
  ...placementRule.shape,
  tags: z.string().array(),
});
type IntersectionRule = z.infer<typeof IntersectionRuleSchema>;

@injectable()
export default class IntersectionValidator extends Validator<IntersectionRule> {
  constructor(
    @inject(TYPES.IntersectionService)
    private intersectionService: IntersectionService
  ) {
    super();
  }

  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "intersection";
  }

  protected getRuleSchema(): ZodObject {
    return IntersectionRuleSchema;
  }

  protected async passes(
    rule: IntersectionRule,
    object: Object
  ): Promise<PassResult> {
    const intersections =
      await this.intersectionService.getIntersections(object);

    const matchingIntersections = intersections.filter((intersection) =>
      intersection.tags.some((tag) => rule.tags.includes(tag))
    );
    console.log(
      `IntersectionValidator: Found ${matchingIntersections.length} matching intersections for object ${object.id} with tags ${rule.tags.join(", ")}`,
      intersections,
      matchingIntersections
    );

    return {
      passes: matchingIntersections.length > 0,
      highlightedAreas: [],
    };
  }
}
