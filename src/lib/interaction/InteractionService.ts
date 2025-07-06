import { Euler, Quaternion, Vector3 } from "three";
import { useObjectStore } from "../stores/objectStore";
import { inject, injectable } from "tsyringe";
import { TYPES } from "../di/types";
import type TransformationValidator from "../validation/validators/TransformationValidator";
import { clamp } from "../utils";

/**
 * Based on https://github.com/vantezzen/arpas-fpb/blob/main/src/components/prototypes/ModelessTouch/ModelessTouchInteraction.ts
 */
@injectable()
export default class InteractionService {
  private currentTouchPoints: Touch[] = [];

  private cameraPosition = new Vector3();
  private cameraRotation = new Euler();
  private prevCameraPosition = new Vector3();
  private prevCameraRotation = new Euler();

  private prevTouchX: number | null = null;
  private prevTouchY: number | null = null;

  private prevDistance: number | null = null;

  private prevAngle: number | null = null;
  private prevCenterPoint: Vector3 | null = null;
  private mouseDown = false;

  private eventQueue: Touch[] = [];
  private readonly eventQueueSize = 1;

  private deviceOrientation: number = 0;

  private objectScreenPosition: { x: number; y: number } | null = null;

  constructor(
    @inject(TYPES.TransformationValidator)
    private transformationValidator: TransformationValidator
  ) {}

  onCameraMove(cameraPosition: Vector3, cameraRotation: Euler) {
    this.prevCameraPosition.copy(this.cameraPosition);
    this.prevCameraRotation.copy(this.cameraRotation);

    this.cameraPosition.copy(cameraPosition);
    this.cameraRotation.copy(cameraRotation);

    this.handleUpdate();
  }

  onDeviceOrientationChange(orientation: number) {
    this.deviceOrientation = orientation;
  }

  private transformTouchCoordinates(touch: Touch): { x: number; y: number } {
    if (this.deviceOrientation === 0) {
      return { x: touch.clientX, y: touch.clientY };
    }

    const radians = (-this.deviceOrientation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const relativeX = touch.clientX - centerX;
    const relativeY = touch.clientY - centerY;

    const rotatedX = relativeX * cos - relativeY * sin;
    const rotatedY = relativeX * sin + relativeY * cos;

    return {
      x: rotatedX + centerX,
      y: rotatedY + centerY,
    };
  }

  private worldToScreen(worldPosition: Vector3): { x: number; y: number } {
    const cameraQuat = new Quaternion().setFromEuler(this.cameraRotation);
    const cameraForward = new Vector3(0, 0, -1).applyQuaternion(cameraQuat);
    cameraForward.y = 0;
    cameraForward.normalize();

    const worldUp = new Vector3(0, 1, 0);
    const cameraRight = new Vector3().crossVectors(cameraForward, worldUp);
    cameraRight.normalize();

    const cameraFlatPos = new Vector3(
      this.cameraPosition.x,
      worldPosition.y,
      this.cameraPosition.z
    );

    const offset = new Vector3().subVectors(worldPosition, cameraFlatPos);
    const distForward = offset.dot(cameraForward);
    const distRight = offset.dot(cameraRight);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const scale = 100;

    return {
      x: centerX + distRight * scale,
      y: centerY - distForward * scale,
    };
  }

  private screenToWorld(screenPosition: { x: number; y: number }): Vector3 {
    const cameraQuat = new Quaternion().setFromEuler(this.cameraRotation);
    const cameraForward = new Vector3(0, 0, -1).applyQuaternion(cameraQuat);
    cameraForward.y = 0;
    cameraForward.normalize();

    const worldUp = new Vector3(0, 1, 0);
    const cameraRight = new Vector3().crossVectors(cameraForward, worldUp);
    cameraRight.normalize();

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const scale = 100;

    const distRight = (screenPosition.x - centerX) / scale;
    const distForward = -(screenPosition.y - centerY) / scale;

    const cameraFlatPos = new Vector3(
      this.cameraPosition.x,
      0,
      this.cameraPosition.z
    );

    return cameraFlatPos
      .clone()
      .add(cameraForward.clone().multiplyScalar(distForward))
      .add(cameraRight.clone().multiplyScalar(distRight));
  }

  onTouchStart(event: TouchEvent) {
    this.currentTouchPoints = Array.from(event.touches);
    this.eventQueue = [];

    const firstTouch = event.touches[0];
    if (firstTouch) {
      this.prevTouchX = firstTouch.clientX;
      this.prevTouchY = firstTouch.clientY;

      const state = useObjectStore.getState();
      if (state.editingObject) {
        this.objectScreenPosition = this.worldToScreen(
          state.editingObject.position
        );
      }
    }
  }
  onTouchMove(event: TouchEvent) {
    const nextTouchPoints = Array.from(event.touches);

    if (nextTouchPoints.length === 1) {
      this.eventQueue.push(nextTouchPoints[0]);
      if (this.eventQueue.length > this.eventQueueSize) {
        this.eventQueue.shift();
      }
    }

    this.handleUpdate(nextTouchPoints);
    this.currentTouchPoints = nextTouchPoints;

    const firstTouch = event.touches[0];
    if (firstTouch) {
      this.prevTouchX = firstTouch.clientX;
      this.prevTouchY = firstTouch.clientY;
    }
  }
  onTouchEnd(event: TouchEvent) {
    const nextTouchPoints = Array.from(event.touches);
    this.handleUpdate(nextTouchPoints);
    this.currentTouchPoints = nextTouchPoints;
    this.eventQueue = [];

    if (this.currentTouchPoints.length === 0) {
      this.prevTouchX = null;
      this.prevTouchY = null;
      this.currentTouchPoints = [];
      this.objectScreenPosition = null;
    }
    this.prevDistance = null;
    this.prevAngle = null;
    this.prevCenterPoint = null;
  }

  /** Makes a mouse event look like a single‐finger `Touch` for reuse. */
  private static asSyntheticTouch(evt: MouseEvent): Touch {
    // Only the `clientX`/`clientY` properties are used in the math below
    return { clientX: evt.clientX, clientY: evt.clientY } as unknown as Touch;
  }

  onClickStart(event: MouseEvent) {
    if (event.button !== 0) return;

    this.mouseDown = true;

    this.prevTouchX = event.clientX;
    this.prevTouchY = event.clientY;
    this.currentTouchPoints = [InteractionService.asSyntheticTouch(event)];
  }

  onClickMove(event: MouseEvent) {
    if (!this.mouseDown) return;

    const synthetic = InteractionService.asSyntheticTouch(event);
    const nextTouchPoints = [synthetic];

    this.handleUpdate(nextTouchPoints);
    this.currentTouchPoints = nextTouchPoints;

    this.prevTouchX = event.clientX;
    this.prevTouchY = event.clientY;
  }

  onClickEnd() {
    if (!this.mouseDown) return;
    this.mouseDown = false;

    // Run one last update with zero points to finish any interaction
    this.handleUpdate([]);

    this.currentTouchPoints = [];
    this.prevTouchX = null;
    this.prevTouchY = null;
    this.prevDistance = null;
    this.prevAngle = null;
    this.prevCenterPoint = null;
  }

  private handleUpdate(nextTouchPoints?: Touch[]) {
    this.updateMove(nextTouchPoints);
    this.updateScale(nextTouchPoints);
    this.updateRotate(nextTouchPoints);
  }

  updateMove(nextTouchPoints?: Touch[]) {
    const touchPoints = nextTouchPoints || this.currentTouchPoints;
    if (touchPoints.length !== 1) return;

    const currentTouch = touchPoints[0];
    if (this.prevTouchX === null || this.prevTouchY === null) return;

    if (
      this.eventQueue.length > 0 &&
      this.eventQueue.length < this.eventQueueSize
    ) {
      return;
    }

    const state = useObjectStore.getState();
    if (!state.editingObject) {
      console.warn("Tried moving object but no object selected");
      return;
    }

    const transformedTouch = this.transformTouchCoordinates(currentTouch);
    const transformedPrevTouch = this.transformTouchCoordinates({
      clientX: this.prevTouchX,
      clientY: this.prevTouchY,
    } as Touch);

    const deltaX = transformedTouch.x - transformedPrevTouch.x;
    const deltaY = transformedTouch.y - transformedPrevTouch.y;

    if (this.objectScreenPosition) {
      this.objectScreenPosition.x += deltaX;
      this.objectScreenPosition.y += deltaY;
    } else {
      this.objectScreenPosition = this.worldToScreen(
        state.editingObject.position
      );
      this.objectScreenPosition.x += deltaX;
      this.objectScreenPosition.y += deltaY;
    }

    const newWorldPosition = this.screenToWorld(this.objectScreenPosition);
    newWorldPosition.y = state.editingObject.position.y;
    state.editingObject.position = newWorldPosition;
  }

  updateScale(nextTouchPoints?: Touch[]) {
    const touchPoints = nextTouchPoints || this.currentTouchPoints;
    const prevDistance = this.prevDistance;
    if (touchPoints.length !== 2) return;

    const touch1 = touchPoints[0];
    const touch2 = touchPoints[1];

    const transformedTouch1 = this.transformTouchCoordinates(touch1);
    const transformedTouch2 = this.transformTouchCoordinates(touch2);

    const dx = transformedTouch1.x - transformedTouch2.x;
    const dy = transformedTouch1.y - transformedTouch2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.prevDistance = distance;

    if (prevDistance === null) return;

    const distanceDelta = distance - prevDistance;
    const state = useObjectStore.getState();

    if (!state.editingObject) {
      console.warn("Tried to scale object but none selected");
      return;
    }

    const allowedScale = this.transformationValidator.getAllowedRotationScale(
      state.editingObject
    );

    const scale = state.editingObject.scale;
    const newScale = new Vector3(
      scale.x + distanceDelta * 0.01,
      scale.y + distanceDelta * 0.01,
      scale.z + distanceDelta * 0.01
    );

    newScale.x = clamp(newScale.x, allowedScale[0], allowedScale[1]);
    newScale.y = clamp(newScale.y, allowedScale[0], allowedScale[1]);
    newScale.z = clamp(newScale.z, allowedScale[0], allowedScale[1]);

    state.editingObject.scale = newScale;
  }

  updateRotate(nextTouchPoints?: Touch[]) {
    const touchPoints = nextTouchPoints || this.currentTouchPoints;
    if (touchPoints.length !== 2) return;

    if (this.prevTouchX === null || this.prevTouchY === null) return;

    const touch1 = touchPoints[0];
    const touch2 = touchPoints[1];

    const transformedTouch1 = this.transformTouchCoordinates(touch1);
    const transformedTouch2 = this.transformTouchCoordinates(touch2);

    const angle = Math.atan2(
      transformedTouch2.y - transformedTouch1.y,
      transformedTouch2.x - transformedTouch1.x
    );
    const prevAngle = this.prevAngle;
    this.prevAngle = angle;
    if (prevAngle === null) return;

    const angleDelta = angle - prevAngle;
    const state = useObjectStore.getState();

    if (!state.editingObject) {
      console.warn("Tried to rotate object but none selected");
      return;
    }

    const rotation = state.editingObject.rotation;

    const yRotation = rotation.y - angleDelta;

    let xRotation = rotation.x;
    let zRotation = rotation.z;

    const centerPoint = new Vector3(
      (transformedTouch1.x + transformedTouch2.x) / 2,
      (transformedTouch1.y + transformedTouch2.y) / 2,
      0
    );
    const prevCenterPoint = this.prevCenterPoint;
    this.prevCenterPoint = centerPoint;

    if (prevCenterPoint) {
      const centerPointDelta = new Vector3().subVectors(
        centerPoint,
        prevCenterPoint
      );
      xRotation = rotation.x + centerPointDelta.y * 0.01;
      zRotation = rotation.z - centerPointDelta.x * 0.01;
    }

    const allowedAxes = this.transformationValidator.getAllowedRotationAxes(
      state.editingObject
    );

    const newRotation = new Euler(
      allowedAxes.includes("x") ? xRotation : rotation.x,
      allowedAxes.includes("y") ? yRotation : rotation.y,
      allowedAxes.includes("z") ? zRotation : rotation.z
    );
    state.editingObject.rotation = newRotation;
  }
}
