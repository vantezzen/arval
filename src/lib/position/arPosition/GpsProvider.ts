import EventEmitter from "events";

export default class GpsProvider extends EventEmitter {
  latitude: number | null = null;
  longitude: number | null = null;
  compassDirection: number | null = null;
  hasPermissions = false;
  geolocationWatchId: number | null = null;

  constructor() {
    super();

    this.handleOrientationEvent = this.handleOrientationEvent.bind(this);
    this.handleGeolocationEvent = this.handleGeolocationEvent.bind(this);
  }

  async setup() {
    await this.requestPermissions();

    window.addEventListener("deviceorientation", this.handleOrientationEvent);
    navigator.geolocation.getCurrentPosition(this.handleGeolocationEvent);
    this.geolocationWatchId = navigator.geolocation.watchPosition(
      this.handleGeolocationEvent,
    );
  }

  async requestPermissions() {
    if (this.hasPermissions) return;

    try {
      await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      await navigator.permissions.query({
        name: "accelerometer" as PermissionName,
      });
      await navigator.permissions.query({
        name: "magnetometer" as PermissionName,
      });
      this.hasPermissions = true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
    }
  }

  // Based on https://github.com/vantezzen/fpa-arpas-prototyping/blob/main/src/components/prototype/hooks/useCorrectedCompass.ts
  handleOrientationEvent(event: DeviceOrientationEvent) {
    const alpha = event.alpha as number;
    const beta = event.beta as number;
    const gamma = event.gamma as number;

    // Convert degrees to radians
    const alphaRad = alpha * (Math.PI / 180);
    const betaRad = beta * (Math.PI / 180);
    const gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    const cA = Math.cos(alphaRad);
    const sA = Math.sin(alphaRad);
    const sB = Math.sin(betaRad);
    const cG = Math.cos(gammaRad);
    const sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    const rA = -cA * sG - sA * sB * cG;
    const rB = -sA * sG + cA * sB * cG;

    // Calculate compass heading
    let compassHeading = Math.atan(rA / rB);

    // Convert from half of unit circle to full unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }

    // Convert to degrees
    compassHeading *= 180 / Math.PI;

    this.compassDirection = compassHeading;

    this.triggerUpdate();
  }

  handleGeolocationEvent(event: GeolocationPosition) {
    this.latitude = event.coords.latitude;
    this.longitude = event.coords.longitude;
    this.triggerUpdate();
  }

  private triggerUpdate() {
    this.emit("update");
  }
}
