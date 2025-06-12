import Interaction from "@/lib/interaction/Interaction";
import InteractionConnector from "@/lib/interaction/InteractionConnector";
import ArPositionProvider from "@/lib/position/arPosition/ArPositionProvider";
import { useAppStore } from "@/lib/stores/appStore";
import { store } from "@/lib/xr";
import { Canvas, useThree } from "@react-three/fiber";
import {
  KeyboardControls,
  type KeyboardControlsEntry,
} from "@react-three/drei";
import { XR } from "@react-three/xr";
import { useMemo, useState } from "react";

function AppCanvasContent() {
  const [interaction] = useState(() => new Interaction());
  return (
    <>
      <InteractionConnector interaction={interaction} />
    </>
  );
}

function AppCanvas() {
  const { camera } = useThree();
  const appStore = useAppStore();

  const keyboardMap = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.jump, keys: ["Space"] },
    ],
    [],
  );

  if (!appStore.position) {
    appStore.update({
      position: new ArPositionProvider(camera),
    });

    return <div>Setting up ...</div>;
  }

  return (
    <Canvas>
      {appStore.xrEnabled ? (
        <XR store={store}>
          <AppCanvasContent />
        </XR>
      ) : (
        <KeyboardControls map={keyboardMap}>
          <AppCanvasContent />
        </KeyboardControls>
      )}
    </Canvas>
  );
}

export default AppCanvas;
