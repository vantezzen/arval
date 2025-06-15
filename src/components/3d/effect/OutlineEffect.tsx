import {
  FC,
} from "react";
import {
  type ColorRepresentation,
} from "three";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import { useEffectData } from "./EffectableGltf";

interface OutlineEffectProps {
  color?: ColorRepresentation;
  resolution?: number; // pixel width
  strength?: number; // edge strength
  blur?: boolean;
}

export const OutlineEffect: FC<OutlineEffectProps> = ({
  color = "black",
  resolution = 1000,
  strength = 2,
  blur = false,
}) => {
  const { meshes } = useEffectData();
  if (!meshes.length) return null;

  return (
    <EffectComposer autoClear={false} multisampling={8}>
      <Outline
        selection={meshes}
        visibleEdgeColor={color as any}
        edgeStrength={strength}
        width={resolution}
        blur={blur}
      />
    </EffectComposer>
  );
};
