import type { ConstraintSet, PlacementRule } from "./schemas/acs.schema";
import type { GlobalRule } from "./schemas/agcs.schema";

export type ResolvedRule = PlacementRule | GlobalRule;

export interface ResolvedRuleset extends ConstraintSet {
  placement: ResolvedRule[];
}
