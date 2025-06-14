import React, { useMemo } from "react";
import * as THREE from "three";
import type { Area } from "@/lib/types/area";

const HIGHLIGHT_COLOR = "#ff0000";
const HIGHLIGHT_OPACITY = 0.1;
const HEIGHT = 5;

const PolygonMesh = ({ area }: { area: Area & { type: "polygon" } }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    area.coordinates.forEach(([x, y], idx) =>
      idx === 0 ? s.moveTo(x, y) : s.lineTo(x, y),
    );
    return s;
  }, [area.coordinates]);

  const geometry = useMemo(
    () =>
      shape
        ? new THREE.ExtrudeGeometry(shape, {
            depth: HEIGHT,
            bevelEnabled: false,
          })
        : null,
    [shape],
  );

  if (!shape || !geometry) return null;

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        color={HIGHLIGHT_COLOR}
        transparent
        opacity={HIGHLIGHT_OPACITY}
      />
    </mesh>
  );
};

const BboxMesh = ({ area }: { area: Area & { type: "bbox" } }) => {
  const geometry = useMemo(() => {
    const [minX, minY, maxX, maxY] = area.coordinates;
    const width = maxX - minX;
    const height = maxY - minY;
    return new THREE.BoxGeometry(width, HEIGHT, height);
  }, [area.coordinates]);

  return (
    <mesh
      geometry={geometry}
      position={[
        (area.coordinates[0] + area.coordinates[2]) / 2,
        0,
        (area.coordinates[1] + area.coordinates[3]) / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        color={HIGHLIGHT_COLOR}
        transparent
        opacity={HIGHLIGHT_OPACITY}
      />
    </mesh>
  );
};

const CircleMesh = ({ area }: { area: Area & { type: "circle" } }) => {
  const geometry = useMemo(() => {
    const segments = 32;
    return new THREE.CylinderGeometry(
      area.radius,
      area.radius,
      HEIGHT,
      segments,
    );
  }, [area.radius]);

  return (
    <mesh
      geometry={geometry}
      position={[area.center[0], 0, area.center[1]]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        color={HIGHLIGHT_COLOR}
        transparent
        opacity={HIGHLIGHT_OPACITY}
      />
    </mesh>
  );
};

export const HighlightArea = ({ areas }: { areas: Area[] }) => {
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
