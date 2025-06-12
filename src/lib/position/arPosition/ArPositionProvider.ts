import { Euler, Quaternion, Vector3, type Camera } from "three";
import type PositionProvider from "../PositionProvider";
import GpsProvider from "./GpsProvider";
import EventEmitter from "events";
import type RealPosition from "@/lib/dto/RealPosition";

/**
 * Based on https://github.com/vantezzen/fpa-arpas-prototyping/blob/main/src/components/prototype/sensorFusion.tsx
 * https://github.com/vantezzen/fpa-arpas-prototyping/blob/main/src/components/prototype/hooks/usePositionCalculator.ts
 */
export default class ArPositionProvider
  extends EventEmitter
  implements PositionProvider
{
  private gps = new GpsProvider();

  constructor(private camera: Camera) {
    super();
    this.gps.setup();
    this.gps.on("update", () => this.triggerUpdate()); // GPS updates also change AR positions
  }

  private getCameraYaw() {
    // Based on https://github.com/vantezzen/fpa-arpas-prototyping/blob/main/src/components/prototype/hooks/useCameraYaw.ts
    const quarternion = new Quaternion();
    this.camera.getWorldQuaternion(quarternion);
    const cameraEuler = new Euler().setFromQuaternion(quarternion, "YXZ");
    const cameraYaw = ((cameraEuler.y * 180) / Math.PI + 360) % 360;

    return cameraYaw;
  }

  private triggerUpdate() {
    this.emit("update");
  }

  convertRealToVirtualPosition(realPosition: RealPosition): Vector3 {
    if (
      !this.gps.compassDirection ||
      !this.gps.latitude ||
      !this.gps.longitude
    ) {
      console.error("Tried to convert position before GPS is ready");
      return new Vector3(0, 0, 0);
    }

    const R = 6371000; // Earth's radius in meters

    const φ1 = (this.gps.latitude * Math.PI) / 180;
    const φ2 = (realPosition.latitude * Math.PI) / 180;
    const Δφ = ((realPosition.latitude - this.gps.latitude) * Math.PI) / 180;
    const Δλ = ((realPosition.longitude - this.gps.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const bearing = ((θ * 180) / Math.PI + 360) % 360;

    const cameraYaw = this.getCameraYaw();

    // Calculate the relative rotation between heading and camera yaw
    const relativeRotation =
      (360 - this.gps.compassDirection - cameraYaw + 360) % 360;

    // Apply the relative rotation to the bearing
    const virtualBearing = (bearing - relativeRotation + 360) % 360;
    const virtualBearingRad = (virtualBearing * Math.PI) / 180;
    const xPosition = distance * Math.cos(virtualBearingRad);
    const zPosition = distance * Math.sin(virtualBearingRad);

    return new Vector3(xPosition, 0, zPosition);
  }

  convertVirtualToRealPosition(): RealPosition {
    throw new Error("Not implemented");
  }
}
