import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import Interaction from "./InteractionService";

/**
 * Based on https://github.com/vantezzen/arpas-fpb/blob/main/src/components/prototypes/UpdateInteraction.tsx
 */
function InteractionConnector({ interaction }: { interaction: Interaction }) {
  useFrame((state) => {
    interaction.onCameraMove(state.camera.position, state.camera.rotation);
  });

  useEffect(() => {
    console.log("Setup InteractionConnector");

    const onTouchStart = interaction.onTouchStart.bind(interaction);
    const onTouchMove = interaction.onTouchMove.bind(interaction);
    const onTouchEnd = interaction.onTouchEnd.bind(interaction);

    const onClickStart = interaction.onClickStart.bind(interaction);
    const onClickMove = interaction.onClickMove.bind(interaction);
    const onClickEnd = interaction.onClickEnd.bind(interaction);

    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    document.addEventListener("mousedown", onClickStart);
    document.addEventListener("mousemove", onClickMove);
    document.addEventListener("mouseup", onClickEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);

      document.removeEventListener("mousedown", onClickStart);
      document.removeEventListener("mousemove", onClickMove);
      document.removeEventListener("mouseup", onClickEnd);
    };
  }, [interaction]);

  return null;
}

export default InteractionConnector;
