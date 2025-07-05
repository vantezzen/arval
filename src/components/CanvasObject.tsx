import type Object from "@/lib/dto/Object";
import { useEffect, useState } from "react";
import { useUpdate } from "react-use";
import ValidationErrors from "./ValidationErrors";
import type { ValidationResult } from "@/lib/types/validation";
import HighlightArea from "./HighlightAreas";
import { container } from "tsyringe";
import type ValidationOrchestrator from "@/lib/validation/ValidationOrchestrator";
import { TYPES } from "@/lib/di/types";
import { useObjectStore } from "@/lib/stores/objectStore";
import OBJECTS from "@/lib/config/objects";
// import { EffectableGltf } from "./3d/effect/EffectableGltf";
// import { OutlineEffect } from "./3d/effect/OutlineEffect";
// import { OverlayEffect } from "./3d/effect/OverlayEffect";
import {
  EffectableGltf,
  OutlineEffect,
  OverlayEffect,
} from "@vantezzen/effectable-gltf";
import { useCreativityStore } from "@/lib/stores/creativityLevelStore";
import { IS_AR_ENABLED } from "@/lib/config/static";

function CanvasObject({ object }: { object: Object }) {
  const update = useUpdate();
  const validation = container.resolve<ValidationOrchestrator>(
    TYPES.ValidationOrchestrator
  );
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    errors: [],
    highlightedAreas: [],
  });
  const objectStore = useObjectStore();
  const creativityLevel = useCreativityStore((state) => state.creativityLevel);

  useEffect(() => {
    const onUpdate = () => {
      update();

      if (!validation.isValidationInProgress(object.id)) {
        validation.debouncedValidate(object).then((errors) => {
          if (errors === null) {
            // We've been debounced, so we don't update the state
            return;
          }

          // console.log("validation", errors);
          setValidationResult(errors);
        });
      }
    };

    object.on("update", onUpdate);
    return () => {
      object.off("update", onUpdate);
    };
  }, [object, update, validation]);
  const isEditing = objectStore.editingObject?.id === object.id;

  return (
    <>
      <EffectableGltf
        position={object.position}
        src={OBJECTS[object.type as keyof typeof OBJECTS].model}
        rotation={object.rotation}
        scale={object.scale}
        onPointerDown={() => {
          if (!isEditing) {
            objectStore.setEditingObject(object);
          }
        }}
      >
        {isEditing && !IS_AR_ENABLED && <OutlineEffect color="white" />}
        {validationResult.errors.length > 0 &&
          isEditing &&
          creativityLevel < 1 && <OverlayEffect color="red" opacity={0.3} />}
      </EffectableGltf>
      {creativityLevel < 1 && (
        <HighlightArea areas={validationResult.highlightedAreas} />
      )}
      {isEditing && creativityLevel < 2 && (
        <>
          <ValidationErrors errors={validationResult.errors} object={object} />
        </>
      )}
    </>
  );
}

export default CanvasObject;
