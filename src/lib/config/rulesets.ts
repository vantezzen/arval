import BenchConstraints from "@/assets/constraints/Bench.constraints.json";
import FiretrucksGlobalConstraints from "@/assets/constraints/Firetrucks.global-constraints.json";
import UtilityGlobalConstraints from "@/assets/constraints/Utility.global-constraints.json";
import ZebraCrossingConstraints from "@/assets/constraints/ZebraCrossing.constraints.json";
import type { ConstraintSet } from "../types/schemas/acs.schema";
import type { GlobalConstraints } from "../types/schemas/agcs.schema";

function asConstraintSet(json: any): ConstraintSet {
  return json as ConstraintSet;
}
export const ObjectRulesets: Record<string, ConstraintSet[]> = {
  bench: [
    asConstraintSet(BenchConstraints),
    // asConstraintSet(PerformanceConstraints),
  ],
  zebraCrossing: [asConstraintSet(ZebraCrossingConstraints)],
};

function asGlobalConstraintSet(json: any): GlobalConstraints {
  return json as GlobalConstraints;
}
export const GlobalRulesets: Array<GlobalConstraints> = [
  asGlobalConstraintSet(FiretrucksGlobalConstraints),
  asGlobalConstraintSet(UtilityGlobalConstraints),
];
