import type Object from "@/lib/dto/Object";
import { inject, injectable } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import type ValidationRuleResolver from "../ValidationRuleResolver";
import {
  CreativityLevel,
  useCreativityStore,
} from "@/lib/stores/creativityLevelStore";

export type Axis = "x" | "y" | "z";
const allAxis = ["x", "y", "z"] as const;

@injectable()
export default class TransformationValidator {
  constructor(
    @inject(TYPES.ValidationRuleResolver)
    private ruleResolver: ValidationRuleResolver
  ) {}

  getAllowedRotationAxes(object: Object): Axis[] {
    if (
      useCreativityStore.getState().creativityLevel === CreativityLevel.CREATIVE
    ) {
      // In creative mode, all axes are allowed
      return [...allAxis];
    }

    const ruleset = this.ruleResolver.resolveRulesetForObject(object.type);
    for (const rule of ruleset.transform) {
      if (rule.subject === "rotation") {
        const isRestrictive = rule.action === "allow-only";

        return isRestrictive
          ? rule.axes!
          : (allAxis.filter((axis) => rule.axes!.includes(axis)) as Axis[]);
      }
    }

    return [...allAxis];
  }
}
