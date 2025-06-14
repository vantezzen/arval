import type Validation from "./Validation";
import type Object from "../dto/Object";
import { GroundType } from "../types/world";
import GROUND_TAGS from "../config/groundTags";

export default class Ground {
  constructor(private validation: Validation) {}

  async getGroundType(object: Object): Promise<GroundType[]> {
    const cornerPoints =
      await this.validation.size.getObjectCornerPoints(object);
    return cornerPoints.map((p) =>
      this.validation.segmentation.getGroundTypeAtPosition(p),
    );
  }

  getGroundTagsForTypes(types: GroundType[]): string[] {
    const tags = types.map((type) => GROUND_TAGS[type]).flat();

    return [...new Set(tags)];
  }
}
