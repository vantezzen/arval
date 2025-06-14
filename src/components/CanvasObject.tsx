import MODELS from "@/lib/config/models";
import type Object from "@/lib/dto/Object";
import { useAppStore } from "@/lib/stores/appStore";
import { Gltf } from "@react-three/drei";
import { useEffect, useState } from "react";
import { useUpdate } from "react-use";
import ValidationErrors from "./ValidationErrors";
import RedOverlayedGltf from "./RedOverlayedGltf";
import type { ValidationResult } from "@/lib/validation/Validation";
import HighlightArea from "./HighlightAreas";

function CanvasObject({ object }: { object: Object }) {
  const update = useUpdate();
  const validation = useAppStore((store) => store.validation);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    errors: [],
    highlightedAreas: [],
  });

  useEffect(() => {
    const onUpdate = () => {
      update();

      validation.ground.getGroundType(object).then((groundType) => {
        console.log("GroundType", groundType);
      });

      validation.validate(object).then((errors) => {
        console.log("validation", errors);
        setValidationResult(errors);
      });
    };

    object.on("update", onUpdate);
    return () => {
      object.off("update", onUpdate);
    };
  }, [object, update]);

  const GltfComponent =
    validationResult.errors.length > 0 ? RedOverlayedGltf : Gltf;

  console.log("validationResult", validationResult);

  return (
    <>
      <GltfComponent
        position={object.position}
        src={MODELS[object.objectType as keyof typeof MODELS]}
        rotation={object.rotation}
        scale={object.scale}
      />
      <ValidationErrors errors={validationResult.errors} object={object} />

      <HighlightArea areas={validationResult.highlightedAreas} />
    </>
  );
}

export default CanvasObject;
