import type Object from "@/lib/dto/Object";
import { Gltf } from "@react-three/drei";
import { useEffect, useState } from "react";
import { useUpdate } from "react-use";
import ValidationErrors from "./ValidationErrors";
import RedOverlayedGltf from "./RedOverlayedGltf";
import type { ValidationResult } from "@/lib/validation/Validation";
import HighlightArea from "./HighlightAreas";
import { container } from "tsyringe";
import type Validation from "@/lib/validation/Validation";
import { TYPES } from "@/lib/di/types";
import { useObjectStore } from "@/lib/stores/objectStore";
import OBJECTS from "@/lib/config/objects";

function CanvasObject({ object }: { object: Object }) {
  const update = useUpdate();
  const validation = container.resolve<Validation>(TYPES.Validation);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    errors: [],
    highlightedAreas: [],
  });
  const objectStore = useObjectStore();

  useEffect(() => {
    const onUpdate = () => {
      update();

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

  return (
    <>
      <GltfComponent
        position={object.position}
        src={OBJECTS[object.type as keyof typeof OBJECTS].model}
        rotation={object.rotation}
        scale={object.scale}
        onClick={() => {
          if (objectStore.editingObject?.id !== object.id) {
            objectStore.setEditingObject(object);
          }
        }}
      />
      <ValidationErrors errors={validationResult.errors} object={object} />

      <HighlightArea areas={validationResult.highlightedAreas} />
    </>
  );
}

export default CanvasObject;
