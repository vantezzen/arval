import type { Area, CircleArea, BboxArea, PolygonArea } from "../types/area";

export function isTagMatched(targetTagList: string[], objectTagList: string[]) {
  return targetTagList.some((tag) => objectTagList.includes(tag));
}

export function getUniqueAreas(areas: Area[]): Area[] {
  return areas.filter((area, index, self) => {
    // Find the first occurrence of this area
    const firstIndex = self.findIndex((a) => isSameArea(a, area));
    // Keep only the first occurrence
    return firstIndex === index;
  });
}

function isSameArea(a: Area, b: Area): boolean {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case "circle": {
      const circleA = a as CircleArea;
      const circleB = b as CircleArea;
      return (
        circleA.center[0] === circleB.center[0] &&
        circleA.center[1] === circleB.center[1] &&
        circleA.radius === circleB.radius
      );
    }
    case "bbox": {
      const bboxA = a as BboxArea;
      const bboxB = b as BboxArea;
      return (
        bboxA.coordinates[0] === bboxB.coordinates[0] &&
        bboxA.coordinates[1] === bboxB.coordinates[1] &&
        bboxA.coordinates[2] === bboxB.coordinates[2] &&
        bboxA.coordinates[3] === bboxB.coordinates[3]
      );
    }
    case "polygon": {
      const polyA = a as PolygonArea;
      const polyB = b as PolygonArea;
      if (polyA.coordinates.length !== polyB.coordinates.length) return false;

      // Compare each coordinate pair
      return polyA.coordinates.every((coordA, i) => {
        const coordB = polyB.coordinates[i];
        return coordA[0] === coordB[0] && coordA[1] === coordB[1];
      });
    }
  }
}
