import { GroundType } from "@/lib/types/world";
import type { Vector3 } from "three";
import type SegmentationProvider from "../SegmentationProvider";
import streetData from "./example.geo.json";
import type { FeatureCollection, Polygon, Geometry } from "geojson";
import {
  calculateDistanceToLine,
  calculateDistanceToPolygon,
} from "@/lib/utils/math";
import GROUND_TAGS from "@/lib/config/groundTags";
import { isTagMatched } from "@/lib/validation/utils";
import type { ClosestObject, GroundArea } from "../SegmentationProvider";
import type { Area } from "@/lib/types/area";

export default class GeoJsonSegmentationProvider
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

  getClosestObjectByTag(
    position: Vector3,
    tags: string[]
  ): ClosestObject | undefined {
    const targetFeatures = this.data.features.filter((feature) => {
      const groundType = this.featureTypeToGroundType(
        feature.properties?.featureType
      );
      const groundTags = GROUND_TAGS[groundType];

      return isTagMatched(tags, groundTags);
    });

    let minDistance = Infinity;
    let closestArea: Area | undefined;

    for (const feature of targetFeatures) {
      let distance = Infinity;

      if (feature.geometry.type === "Polygon") {
        distance = calculateDistanceToPolygon(
          position,
          feature.geometry.coordinates[0]
        );
      } else if (feature.geometry.type === "LineString") {
        distance = calculateDistanceToLine(
          position,
          feature.geometry.coordinates
        );
      }

      if (distance < minDistance) {
        closestArea = this.geojsonFeatureToArea(feature.geometry);
        minDistance = Math.min(minDistance, distance);
      }
    }

    return minDistance !== Infinity
      ? { distance: minDistance, area: closestArea }
      : undefined;
  }

  getGroundAreaAtPosition(position: Vector3): GroundArea | undefined {
    const groundFeature = this.getGroundFeatureAtLocation(position);
    if (!groundFeature) return;

    const groundType = this.featureTypeToGroundType(
      (groundFeature.properties?.featureType as string) ?? "unknown"
    );
    const groundArea = this.geojsonFeatureToArea(groundFeature.geometry);

    return {
      type: groundType,
      area: groundArea,
      tags: GROUND_TAGS[groundType],
    };
  }

  private getGroundFeatureAtLocation(position: Vector3) {
    const px = position.x;
    const py = -position.z; // world Z corresponds to GeoJSON Y after our -90° X rotation

    for (const feature of this.data.features) {
      if (feature.geometry.type !== "Polygon") continue;
      const [outer] = feature.geometry.coordinates as Polygon["coordinates"];
      if (this.pointInRing(px, py, outer)) {
        return feature;
      }
    }
  }

  private geojsonFeatureToArea(geometry: Geometry): Area {
    switch (geometry.type) {
      case "Polygon": {
        const [outer] = geometry.coordinates;
        return {
          type: "polygon",
          coordinates: outer,
        };
      }
      case "LineString": {
        // For line strings, we create a bbox that encompasses the line
        const points = geometry.coordinates;
        const xs = points.map(([x]) => x);
        const ys = points.map(([, y]) => y);

        return {
          type: "bbox",
          coordinates: [
            Math.min(...xs),
            Math.min(...ys),
            Math.max(...xs),
            Math.max(...ys),
          ],
        };
      }
      default:
        throw new Error(`Unsupported geometry type: ${geometry.type}`);
    }
  }
}
