import { useGLTF, type GltfProps } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export default function RedOverlayedGltf({
  src,
  opacity = 0.5,
  ...props
}: GltfProps & { opacity?: number }) {
  const { scene } = useGLTF(src);
  const overlay = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: "red",
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
      }
    });
    return clone;
  }, [scene, opacity]);

  return (
    <group {...props}>
      <primitive object={scene} />
      <primitive object={overlay} />
    </group>
  );
}
