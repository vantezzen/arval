import type { Euler, Vector3 } from "three";
import { nanoid } from "nanoid";
import { EventEmitter } from "events";

export default class Object extends EventEmitter {
  private _position: Vector3;
  private _rotation: Euler;
  private _scale: Vector3;

  constructor(
    public objectType: string,
    position: Vector3,
    rotation: Euler,
    scale: Vector3,
    public objectId: string = nanoid(),
  ) {
    super();

    this._position = position;
    this._scale = scale;
    this._rotation = rotation;
  }

  // Proxy getters and setters so we can trigger updates on changes
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
