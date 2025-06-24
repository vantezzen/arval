import { GroundType } from "../types/world";

const GROUND_TAGS: Record<GroundType, string[]> = {
  [GroundType.street]: ["street", "asphalted", "driveable", "bikeable"],
  [GroundType.bikeLane]: ["bikeLane", "asphalted", "bikeable"],
  [GroundType.sidewalk]: ["sidewalk", "asphalted", "walkable"],
  [GroundType.grass]: ["grass", "nature", "walkable"],
  [GroundType.building]: ["building", "asphalted", "tall"],
  [GroundType.junction]: [
    "junction",
    "asphalted",
    "intersection",
    "street",
    "bikeable",
  ],
  [GroundType.unknown]: ["unknown"],
};

export default GROUND_TAGS;
