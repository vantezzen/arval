import type { Area, CircleArea, BboxArea, PolygonArea } from "@/lib/types/area";
import type { ResolvedRule } from "@/lib/types/rules";
import { Vector3, Euler } from "three";
import { EventEmitter } from "events";

// Mock Object class for testing to avoid circular dependencies
export class MockObject extends EventEmitter {
  private _position: Vector3;
  private _rotation: Euler;
  private _scale: Vector3;

  constructor(
    public type: string,
    position: Vector3,
    rotation: Euler,
    scale: Vector3,
    public id: string
  ) {
    super();
    this._position = position;
    this._rotation = rotation;
    this._scale = scale;
  }

  set position(position: Vector3) {
    this._position = position;
    this.emit("update");
  }

  get position() {
    return this._position;
  }

  set rotation(rotation: Euler) {
    this._rotation = rotation;
    this.emit("update");
  }

  get rotation() {
    return this._rotation;
  }

  set scale(scale: Vector3) {
    this._scale = scale;
    this.emit("update");
  }

  get scale() {
    return this._scale;
  }
}

// Type alias that works with both real Object and MockObject
export type TestObject = MockObject;

export const createTestObject = (
  type: string = "tree",
  position: Vector3 = new Vector3(0, 0, 0),
  rotation: Euler = new Euler(0, 0, 0),
  scale: Vector3 = new Vector3(1, 1, 1),
  id: string = "test-object-id"
): TestObject => {
  return new MockObject(type, position, rotation, scale, id);
};

export const createCircleArea = (
  center: [number, number] = [0, 0],
  radius: number = 5
): CircleArea => ({
  type: "circle",
  center,
  radius,
});

export const createBboxArea = (
  coordinates: number[] = [0, 0, 10, 10]
): BboxArea => ({
  type: "bbox",
  coordinates,
});

export const createPolygonArea = (
  coordinates: number[][] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ]
): PolygonArea => ({
  type: "polygon",
  coordinates,
});

export const createTestRule = (
  subject: string = "area",
  action: "allow-only" | "forbid" | "require" = "forbid",
  reason: string = "Test rule",
  reasonType: "atomic" | "full" = "atomic",
  additionalProps: Record<string, any> = {}
): ResolvedRule => ({
  subject,
  action,
  reason,
  reasonType,
  ...additionalProps,
});

export const createAreaRule = (
  area: Area,
  action: "allow-only" | "forbid" | "require" = "forbid",
  reason: string = "Area validation rule"
): ResolvedRule => ({
  subject: "area",
  action,
  reason,
  reasonType: "atomic",
  area,
});

export const createDistanceRule = (
  tags: string[] = ["tree"],
  distance: number = 5,
  action: "allow-only" | "forbid" | "require" = "forbid",
  reason: string = "Distance validation rule"
): ResolvedRule => ({
  subject: "distanceTo",
  action,
  reason,
  reasonType: "atomic",
  tags,
  distance,
});

export const createSurfaceRule = (
  tags: string[] = ["grass"],
  action: "allow-only" | "forbid" | "require" = "forbid",
  reason: string = "Surface validation rule"
): ResolvedRule => ({
  subject: "surface",
  action,
  reason,
  reasonType: "atomic",
  tags,
});
