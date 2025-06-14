import type Validation from "./Validation";
import type Object from "../dto/Object";
import type { GroundArea } from "../segmentation/SegmentationProvider";

export default class Ground {
  constructor(private validation: Validation) {}

  async getGroundType(object: Object): Promise<GroundArea[]> {
    const cornerPoints =
      await this.validation.size.getObjectCornerPoints(object);
    return cornerPoints
      .map((p) => this.validation.segmentation.getGroundAreaAtPosition(p))
      .filter(Boolean);
  }
}
