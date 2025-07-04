import { useMemo } from "react";
import * as THREE from "three";
import type { Area } from "@/lib/types/area";
import { useIsClickDown } from "@/lib/hooks/useIsClickDown";
import { IS_AR_ENABLED } from "@/lib/config/static";

const HIGHLIGHT_COLOR = "#ff0000";
const HIGHLIGHT_OPACITY = IS_AR_ENABLED ? 0.25 : 0.1;
const HEIGHT = 0.01;

const PolygonMesh = ({ area }: { area: Area & { type: "polygon" } }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    area.coordinates.forEach(([x, z], idx) =>
      idx === 0 ? s.moveTo(x, z) : s.lineTo(x, z)
    );
    return s;
  }, [area.coordinates]);

  const geometry = useMemo(
    () => (shape ? new THREE.ShapeGeometry(shape) : null),
    [shape]
  );

  if (!shape || !geometry) return null;

  return (
    <mesh
      geometry={geometry}
      position={[0, HEIGHT, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <meshBasicMaterial
        color={HIGHLIGHT_COLOR}
        transparent
        opacity={HIGHLIGHT_OPACITY}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const BboxMesh = ({ area }: { area: Area & { type: "bbox" } }) => {
  const geometry = useMemo(() => {
    const [minX, minZ, maxX, maxZ] = area.coordinates;
    const width = maxX - minX;
    const depth = maxZ - minZ;
    return new THREE.PlaneGeometry(width, depth);
  }, [area.coordinates]);

  return (
    <mesh
      geometry={geometry}
      position={[
        (area.coordinates[0] + area.coordinates[2]) / 2,
        HEIGHT,
        (area.coordinates[1] + area.coordinates[3]) / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <meshBasicMaterial
        color={HIGHLIGHT_COLOR}
        transparent
        opacity={HIGHLIGHT_OPACITY}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const CircleMesh = ({ area }: { area: Area & { type: "circle" } }) => {
  const geometry = useMemo(() => {
    const segments = 32;
    return new THREE.CircleGeometry(area.radius, segments);
  }, [area.radius]);

  return (
    <mesh
      geometry={geometry}
      position={[area.center[0], HEIGHT, area.center[1]]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <meshBasicMaterial
        color={HIGHLIGHT_COLOR}
        transparent
        opacity={HIGHLIGHT_OPACITY}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export const HighlightArea = ({ areas }: { areas: Area[] }) => {
  const isClickDown = useIsClickDown();
  if (!isClickDown) return null;

  return (
    <group name="HighlightedAreas">
      {areas.map((area, idx) => {
        if (area.type === "polygon") {
          return <PolygonMesh key={idx} area={area} />;
        }
        if (area.type === "bbox") {
          return <BboxMesh key={idx} area={area} />;
        }
        if (area.type === "circle") {
          return <CircleMesh key={idx} area={area} />;
        }
        return null;
      })}
    </group>
  );
};

export default HighlightArea;
