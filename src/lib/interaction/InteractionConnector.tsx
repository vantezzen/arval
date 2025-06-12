import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import Interaction from "./Interaction";

/**
 * Based on https://github.com/vantezzen/arpas-fpb/blob/main/src/components/prototypes/UpdateInteraction.tsx
 */
function InteractionConnector({ interaction }: { interaction: Interaction }) {
  useFrame((state) => {
    interaction.onCameraMove(state.camera.position, state.camera.rotation);
  });

  useEffect(() => {
    const onTouchStart = interaction.onTouchStart.bind(interaction);
    const onTouchMove = interaction.onTouchMove.bind(interaction);
    const onTouchEnd = interaction.onTouchEnd.bind(interaction);

    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [interaction]);

  return null;
}

export default InteractionConnector;
