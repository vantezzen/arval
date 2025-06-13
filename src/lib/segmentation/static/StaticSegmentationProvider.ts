import { GroundType } from "@/lib/types/world";
import type { Vector3 } from "three";
import type SegmentationProvider from "../SegmentationProvider";
import streetData from "./example.geo.json";
import type { FeatureCollection, Polygon } from "geojson";

export default class StaticSegmentationProvider
  implements SegmentationProvider
{
  // @ts-expect-error Street data
  private data = streetData as FeatureCollection;

  /**
   * 2‑D point‑in‑ring test (ray–casting) — ignores holes for our simple case.
   */
  private pointInRing(px: number, py: number, ring: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0],
        yi = ring[i][1];
      const xj = ring[j][0],
        yj = ring[j][1];
      const intersect =
        yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  getGroundTypeAtPosition(position: Vector3): GroundType {
    const px = position.x;
    const py = position.z; // world Z corresponds to GeoJSON Y after our -90° X rotation

    for (const feature of this.data.features) {
      if (feature.geometry.type !== "Polygon") continue;
      const [outer] = feature.geometry.coordinates as Polygon["coordinates"];
      if (this.pointInRing(px, py, outer)) {
        return this.featureTypeToGroundType(
          (feature.properties?.featureType as string) ?? "unknown",
        );
      }
    }
    return GroundType.unknown;
  }

  private featureTypeToGroundType(featureType: string): GroundType {
    const CONVERSION: Record<string, GroundType> = {
      sidewalk: GroundType.sidewalk,
      greenVerge: GroundType.grass,
      roadCentre: GroundType.street,
      roadway: GroundType.street,
      bikeLane: GroundType.bikeLane,
    };

    return CONVERSION[featureType] ?? GroundType.unknown;
  }
}
