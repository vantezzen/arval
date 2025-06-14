import MODELS from "@/lib/config/models";
import type Object from "@/lib/dto/Object";
import { useAppStore } from "@/lib/stores/appStore";
import { Gltf } from "@react-three/drei";
import { useEffect, useState } from "react";
import { useUpdate } from "react-use";
import ValidationErrors from "./ValidationErrors";
import RedOverlayedGltf from "./RedOverlayedGltf";

function CanvasObject({ object }: { object: Object }) {
  const update = useUpdate();
  const validation = useAppStore((store) => store.validation);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const onUpdate = () => {
      update();

      validation.ground.getGroundType(object).then((groundType) => {
        console.log("GroundType", groundType);
      });

      validation.validate(object).then((errors) => {
        console.log("validation", errors);
        setErrors(errors);
      });
    };

    object.on("update", onUpdate);
    return () => {
      object.off("update", onUpdate);
    };
  }, [object, update]);

  const GltfComponent = errors.length > 0 ? RedOverlayedGltf : Gltf;

  return (
    <>
      <GltfComponent
        position={object.position}
        src={MODELS[object.objectType as keyof typeof MODELS]}
        rotation={object.rotation}
        scale={object.scale}
      />
      <ValidationErrors errors={errors} object={object} />
    </>
  );
}

export default CanvasObject;
