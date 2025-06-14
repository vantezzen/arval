import type { ResolvedRule } from "@/lib/types/rules";
import Validator, { type PassResult } from "./Validator";
import z, { type ZodObject } from "zod/v4";
import type Object from "@/lib/dto/Object";
import { placementRule } from "@/lib/types/acs";
import {
  calculateDistanceToCircle,
  isPointInBbox,
  isPointInPolygon,
} from "@/lib/utils/math";
import { Vector3 } from "three";
import {
  areaSchema,
  type Area,
  type BboxArea,
  type CircleArea,
  type PolygonArea,
} from "@/lib/types/area";

const areaRuleSchema = z.object({
  ...placementRule.shape,
  area: areaSchema,
});
type AreaRule = z.infer<typeof areaRuleSchema>;

export default class AreaValidator extends Validator<AreaRule> {
  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "area";
  }

  protected getRuleSchema(): ZodObject {
    return areaRuleSchema;
  }

  protected async passes(rule: AreaRule, object: Object): Promise<PassResult> {
    const { area } = rule;
    const { position } = object;
    const passes = this.passesArea(area, position);

    return {
      passes,
      highlightedAreas: [area],
    };
  }

  private passesArea(area: Area, position: Vector3) {
    switch (area.type) {
      case "circle":
        return this.passesCircleArea(area, position);
      case "bbox":
        return this.passesBboxArea(area, position);
      case "polygon":
        return this.passesPolygonArea(area, position);
    }
  }

  private passesCircleArea(area: CircleArea, position: Vector3): boolean {
    const { center, radius } = area;
    const distance = calculateDistanceToCircle(
      position,
      new Vector3(center[0], 0, center[1]),
      radius,
    );
    return distance <= radius;
  }

  private passesBboxArea(area: BboxArea, position: Vector3): boolean {
    const { coordinates } = area;
    return isPointInBbox(position, coordinates);
  }

  private passesPolygonArea(area: PolygonArea, position: Vector3): boolean {
    const { coordinates } = area;
    return isPointInPolygon(position, coordinates);
  }
}
