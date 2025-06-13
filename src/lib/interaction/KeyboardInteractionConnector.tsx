import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { Controls } from "@/lib/types/interface";
import { Vector3 } from "three";

const MOVE_SPEED = 1 / 10; // units per frame
const ROTATE_SPEED = 1 / 70; // radians per frame

function KeyboardInteractionConnector() {
  const [, get] = useKeyboardControls<Controls>();
  const { camera } = useThree();

  useFrame(() => {
    const { forward, back, left, right, up, down, rotateLeft, rotateRight } =
      get();

    const direction = new Vector3(
      (left ? -1 : 0) + (right ? 1 : 0),
      (down ? -1 : 0) + (up ? 1 : 0),
      (forward ? -1 : 0) + (back ? 1 : 0),
    );

    if (direction.lengthSq() !== 0) {
      direction
        .normalize()
        .multiplyScalar(MOVE_SPEED)
        .applyQuaternion(camera.quaternion);

      camera.position.add(direction);
    }

    const yaw = ((rotateLeft ? 1 : 0) + (rotateRight ? -1 : 0)) * ROTATE_SPEED;

    if (yaw !== 0) {
      camera.rotation.y += yaw;
    }
  });

  return null;
}

export default KeyboardInteractionConnector;
