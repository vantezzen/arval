import type SegmentationProvider from "../segmentation/SegmentationProvider";
import StaticSegmentationProvider from "../segmentation/static/StaticSegmentationProvider";
import Ground from "./Ground";

export default class Validation {
  public segmentation: SegmentationProvider = new StaticSegmentationProvider();
  public ground = new Ground(this);
}
