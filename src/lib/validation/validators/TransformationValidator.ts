import type Object from "@/lib/dto/Object";
import type Validation from "../Validation";

export type Axis = "x" | "y" | "z";
const allAxis = ["x", "y", "z"] as const;

export default class TransformationValidator {
  constructor(private validation: Validation) {}

  getAllowedRotationAxes(object: Object): Axis[] {
    const ruleset = this.validation.ruleResolver.resolveRulesetForObject(
      object.objectType,
    );
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
