import MODELS from "@/lib/config/models";
import type Object from "@/lib/dto/Object";
import { useAppStore } from "@/lib/stores/appStore";
import { Gltf } from "@react-three/drei";
import { useEffect } from "react";
import { useUpdate } from "react-use";

function CanvasObject({ object }: { object: Object }) {
  const update = useUpdate();
  const validation = useAppStore((store) => store.validation);

  useEffect(() => {
    const onUpdate = () => {
      update();

      validation.ground.getGroundType(object).then((groundType) => {
        console.log("GroundType", groundType);
      });
    };

    object.on("update", onUpdate);
    return () => {
      object.off("update", onUpdate);
    };
  }, [object, update]);

  return (
    <Gltf
      position={object.position}
      src={MODELS[object.objectType as keyof typeof MODELS]}
      rotation={object.rotation}
      scale={object.scale}
    />
  );
}

export default CanvasObject;
