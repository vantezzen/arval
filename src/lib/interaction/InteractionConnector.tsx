import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import Interaction from "./InteractionService";
import DevelopmentMouseHandler from "./DevelopmentMouseHandler";
import TouchPointVisualization from "../../components/TouchPointVisualization";
import { Portal } from "@/components/Portal";
import { IS_AR_ENABLED } from "../config/static";

/**
 * Based on https://github.com/vantezzen/arpas-fpb/blob/main/src/components/prototypes/UpdateInteraction.tsx
 */
function InteractionConnector({ interaction }: { interaction: Interaction }) {
  const [mouseState, setMouseState] = useState<any>(null);

  useFrame((state) => {
    interaction.onCameraMove(state.camera.position, state.camera.rotation);
  });

  useEffect(() => {
    const handler = new DevelopmentMouseHandler(
      (event) => interaction.onTouchStart(event),
      (event) => interaction.onTouchMove(event),
      (event) => interaction.onTouchEnd(event)
    );

    const onTouchStart = interaction.onTouchStart.bind(interaction);
    const onTouchMove = interaction.onTouchMove.bind(interaction);
    const onTouchEnd = interaction.onTouchEnd.bind(interaction);

    const onMouseDown = handler.onMouseDown.bind(handler);
    const onMouseMove = handler.onMouseMove.bind(handler);
    const onMouseUp = handler.onMouseUp.bind(handler);
    const onKeyDown = handler.onKeyDown.bind(handler);
    const onKeyUp = handler.onKeyUp.bind(handler);

    const onDeviceOrientation = (event: Event) => {
      const deviceEvent = event as DeviceOrientationEvent;
      if (deviceEvent.alpha !== null) {
        interaction.onDeviceOrientationChange(deviceEvent.alpha);
      }
    };

    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("deviceorientation", onDeviceOrientation);

    const updateMouseState = () => {
      const state = handler.getMouseState();
      setMouseState(state);
    };

    updateMouseState();
    const interval = setInterval(updateMouseState, 16);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);

      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("deviceorientation", onDeviceOrientation);

      clearInterval(interval);
    };
  }, [interaction]);

  if (!IS_AR_ENABLED) {
    return (
      <Portal>
        <TouchPointVisualization mouseState={mouseState} />
      </Portal>
    );
  }
  return null;
}

export default InteractionConnector;
