import { useMemo } from "react";
import * as THREE from "three";
import type { FeatureCollection, Feature, Polygon, LineString } from "geojson";
import streetData from "@/lib/segmentation/geojson/example.geo.json";

const COLOR_MAP: Record<string, string> = {
  roadway: "#6e6e6e",
  bikeLane: "#2e417d",
  sidewalk: "#cccccc",
  greenVerge: "#7dbf62",
  roadCentre: "#000000",
};

const PolygonMesh = ({
  feature,
  heightScale,
}: {
  feature: Feature;
  heightScale: number;
}) => {
  const shape = useMemo(() => {
    if (feature.geometry.type !== "Polygon") return null;
    const [outer] = feature.geometry.coordinates as Polygon["coordinates"];
    const s = new THREE.Shape();
    outer.forEach(([x, y], idx) =>
      idx === 0 ? s.moveTo(x, y) : s.lineTo(x, y)
    );
    return s;
  }, [feature]);

  const depth =
    (typeof feature.properties?.width === "number"
      ? feature.properties.width
      : 1) * heightScale;

  const geometry = useMemo(
    () =>
      shape
        ? new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
        : null,
    [shape, depth]
  );
  const color =
    COLOR_MAP[feature.properties?.featureType as string] ?? "#aaaaaa";

  if (!shape || !geometry) return null;

  return (
    <mesh
      geometry={geometry}
      rotation={[Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
};

const LineVisual = ({ feature }: { feature: Feature }) => {
  const points = useMemo(() => {
    if (feature.geometry.type !== "LineString") return [];
    return (feature.geometry.coordinates as LineString["coordinates"]).map(
      ([x, y]) => new THREE.Vector3(x, 0.05, y)
    );
  }, [feature]);

  if (!points.length) return null;

  const color =
    COLOR_MAP[feature.properties?.featureType as string] ?? "#000000";

  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial attach="material" color={color} linewidth={1} />
    </line>
  );
};

export const SegmentationVisualization = ({
  // @ts-expect-error Street data
  data = streetData,
  heightScale = 0.01,
}: {
  data?: FeatureCollection;
  heightScale?: number;
}) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 100, 50]} intensity={0.8} castShadow />

      <gridHelper args={[200, 20, "#888888", "#444444"]} />

      <group name="StreetLayout">
        {data.features.map((f, i) => {
          if (f.geometry.type === "Polygon") {
            return (
              <PolygonMesh key={i} feature={f} heightScale={heightScale} />
            );
          }
          if (f.geometry.type === "LineString") {
            return <LineVisual key={i} feature={f} />;
          }
          return null; // ignore other geometry types for now
        })}
      </group>
    </>
  );
};

export default SegmentationVisualization;
