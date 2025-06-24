import type { ResolvedRule } from "@/lib/types/rules";
import Validator, { type PassResult } from "./Validator";
import z, { type ZodObject } from "zod/v4";
import type Object from "@/lib/dto/Object";
import { placementRule } from "@/lib/types/acs";
import { injectable, inject } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import type SegmentationProvider from "@/lib/segmentation/SegmentationProvider";
import type SizeService from "../SizeService";

const IntersectionRuleSchema = z.object({
  ...placementRule.shape,
  tags: z.string().array(),
});
type IntersectionRule = z.infer<typeof IntersectionRuleSchema>;

@injectable()
export default class IntersectionValidator extends Validator<IntersectionRule> {
  constructor(
    @inject(TYPES.SegmentationService)
    private segmentation: SegmentationProvider,
    @inject(TYPES.SizeService) private sizeService: SizeService
  ) {
    super();
  }

  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "intersection";
  }

  protected getRuleSchema(): ZodObject {
    return IntersectionRuleSchema;
  }

  protected async passes(): Promise<PassResult> {
    // TODO: Get intersecting objects from intersection service
    return { passes: true, highlightedAreas: [] };
  }
}
