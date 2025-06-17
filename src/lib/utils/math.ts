import { Vector3 } from "three";

export function calculateDistanceToCircle(
  point: Vector3,
  center: Vector3,
  radius: number
): number {
  return point.distanceTo(center) - radius;
}

export function calculateDistanceToPolygon(
  point: Vector3,
  polygon: number[][]
): number {
  if (!polygon || polygon.length < 3) {
    console.warn("Invalid polygon: must have at least 3 points");
    return Infinity;
  }

  if (isPointInPolygon(point, polygon)) {
    return 0;
  }

  let minDistance = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const start = polygon[i];
    const end = polygon[j];

    if (start[0] === end[0] && start[1] === end[1]) {
      continue;
    }

    const distance = calculateDistanceToLineSegment(
      point,
      new Vector3(start[0], 0, start[1]),
      new Vector3(end[0], 0, end[1])
    );

    if (!isNaN(distance)) {
      minDistance = Math.min(minDistance, distance);
    }
  }
  return minDistance;
}

export function calculateDistanceToLine(
  point: Vector3,
  line: number[][]
): number {
  let minDistance = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const distance = calculateDistanceToLineSegment(
      point,
      new Vector3(line[i][0], 0, line[i][1]),
      new Vector3(line[i + 1][0], 0, line[i + 1][1])
    );
    minDistance = Math.min(minDistance, distance);
  }
  return minDistance;
}

export function calculateDistanceToLineSegment(
  point: Vector3,
  lineStart: Vector3,
  lineEnd: Vector3
): number {
  const line = lineEnd.clone().sub(lineStart);
  const lineLength = line.length();

  if (lineLength === 0) {
    return point.distanceTo(lineStart);
  }

  const lineDir = line.divideScalar(lineLength);
  const pointToStart = point.clone().sub(lineStart);
  const projection = pointToStart.dot(lineDir);

  if (projection < 0) {
    return pointToStart.length();
  }

  if (projection > lineLength) {
    return point.clone().sub(lineEnd).length();
  }

  const projectedPoint = lineStart
    .clone()
    .add(lineDir.multiplyScalar(projection));

  return point.distanceTo(projectedPoint);
}

export function isPointInBbox(point: Vector3, bbox: number[]): boolean {
  const minX = Math.min(bbox[0], bbox[2]);
  const maxX = Math.max(bbox[0], bbox[2]);
  const minZ = Math.min(bbox[1], bbox[3]);
  const maxZ = Math.max(bbox[1], bbox[3]);

  return (
    point.x >= minX && point.x <= maxX && point.z >= minZ && point.z <= maxZ
  );
}

export function isPointInPolygon(
  point: Vector3,
  polygon: number[][],
  epsilon = 1e-6
): boolean {
  if (polygon.length < 3) return false;

  const onSegment = (
    ax: number,
    az: number,
    bx: number,
    bz: number
  ): boolean => {
    if (
      point.x < Math.min(ax, bx) - epsilon ||
      point.x > Math.max(ax, bx) + epsilon ||
      point.z < Math.min(az, bz) - epsilon ||
      point.z > Math.max(az, bz) + epsilon
    )
      return false;

    // colinearity test (2-D cross-product magnitude = 0)
    const cross = (bx - ax) * (point.z - az) - (bz - az) * (point.x - ax);
    return Math.abs(cross) < epsilon;
  };

  let inside = false;
  let prev = polygon[polygon.length - 1];

  for (const curr of polygon) {
    const [xi, zi] = prev;
    const [xj, zj] = curr;

    // point right on an edge
    if (onSegment(xi, zi, xj, zj)) return true;

    const crosses =
      zi > point.z !== zj > point.z && // straddles ray
      point.x < ((xj - xi) * (point.z - zi)) / (zj - zi) + xi; // to the right of point

    if (crosses) inside = !inside;

    prev = curr;
  }
  return inside;
}
