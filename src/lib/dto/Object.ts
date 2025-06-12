import type { Euler, Vector3 } from "three";

export default class Object {
  constructor(
    public objectType: string,
    public objectId: string,
    public position: Vector3,
    public rotation: Euler,
    public scale: Vector3,
  ) {}
}
