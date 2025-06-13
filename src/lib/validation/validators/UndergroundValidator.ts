import type { ResolvedRule } from "@/lib/types/rules";
import Validator from "./Validator";
import z, { type Schema } from "zod";
import type Object from "@/lib/dto/Object";
import { isTagMatched } from "../utils";

export default class UndergroundValidator extends Validator<any> {
  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "underground";
  }

  protected getRuleSchema(): Schema {
    return z.object({
      tags: z.string().array(),
    });
  }

  protected async passes(rule: ResolvedRule, object: Object): Promise<boolean> {
    const currentGroundTypes =
      await this.validation.ground.getGroundType(object);
    const groundTags =
      this.validation.ground.getGroundTagsForTypes(currentGroundTypes);

    return isTagMatched(rule.tags, groundTags);
  }
}
