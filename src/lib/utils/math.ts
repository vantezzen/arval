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
  const minY = Math.min(bbox[1], bbox[3]);
  const maxY = Math.max(bbox[1], bbox[3]);

  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
}

export function isPointInPolygon(point: Vector3, polygon: number[][]): boolean {
  const minX = Math.min(...polygon.map((p) => p[0]));
  const maxX = Math.max(...polygon.map((p) => p[0]));
  const minY = Math.min(...polygon.map((p) => p[1]));
  const maxY = Math.max(...polygon.map((p) => p[1]));

  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    return false;
  }

  let rayCastCount = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const start = polygon[i];
    const end = polygon[j];

    if (start[1] === end[1]) {
      continue;
    }

    const xIntersect =
      ((start[1] - end[1]) / (start[0] - end[0])) * (point.x - start[0]) +
      start[1];
    if (point.y < xIntersect) {
      rayCastCount++;
    }
  }

  return rayCastCount % 2 === 1;
}
