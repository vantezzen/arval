import type Object from "../dto/Object";
import type { GroundArea } from "../segmentation/SegmentationProvider";
import { injectable, inject } from "tsyringe";
import { TYPES } from "../di/types";
import type SegmentationProvider from "../segmentation/SegmentationProvider";
import type SizeService from "./SizeService";

@injectable()
export default class GroundService {
  constructor(
    @inject(TYPES.SegmentationService)
    private segmentationService: SegmentationProvider,
    @inject(TYPES.SizeService) private sizeService: SizeService
  ) {}

  async getGroundType(object: Object): Promise<GroundArea[]> {
    const cornerPoints = await this.sizeService.getObjectCornerPoints(object);
    return cornerPoints
      .map((p) => this.segmentationService.getGroundAreaAtPosition(p))
      .filter(Boolean);
  }
}
