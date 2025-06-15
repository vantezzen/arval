import type Object from "@/lib/dto/Object";
import { useEffect, useState } from "react";
import { useUpdate } from "react-use";
import ValidationErrors from "./ValidationErrors";
import type { ValidationResult } from "@/lib/validation/Validation";
import HighlightArea from "./HighlightAreas";
import { container } from "tsyringe";
import type Validation from "@/lib/validation/Validation";
import { TYPES } from "@/lib/di/types";
import { useObjectStore } from "@/lib/stores/objectStore";
import OBJECTS from "@/lib/config/objects";
import { EffectableGltf } from "./3d/effect/EffectableGltf";
import { OutlineEffect } from "./3d/effect/OutlineEffect";
import { OverlayEffect } from "./3d/effect/OverlayEffect";

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
  const isEditing = objectStore.editingObject?.id === object.id;

  return (
    <>
      <EffectableGltf
        position={object.position}
        src={OBJECTS[object.type as keyof typeof OBJECTS].model}
        rotation={object.rotation}
        scale={object.scale}
        onClick={() => {
          if (!isEditing) {
            objectStore.setEditingObject(object);
          }
        }}
      >
        {isEditing && <OutlineEffect color="#FF0000" />}
        {validationResult.errors.length > 0 && (
          <OverlayEffect color="red" opacity={0.3} />
        )}
      </EffectableGltf>
      {isEditing && (
        <ValidationErrors errors={validationResult.errors} object={object} />
      )}

      <HighlightArea areas={validationResult.highlightedAreas} />
    </>
  );
}

export default CanvasObject;
