import Interaction from "@/lib/interaction/Interaction";
import InteractionConnector from "@/lib/interaction/InteractionConnector";
import { useAppStore } from "@/lib/stores/appStore";
import { store } from "@/lib/xr";
import { Canvas } from "@react-three/fiber";
import {
  GizmoHelper,
  GizmoViewport,
  KeyboardControls,
  type KeyboardControlsEntry,
} from "@react-three/drei";
import { XR } from "@react-three/xr";
import { useMemo, useState } from "react";
import { Controls } from "@/lib/types/interface";
import KeyboardInteractionConnector from "@/lib/interaction/KeyboardInteractionConnector";
import { useObjectStore } from "@/lib/stores/objectStore";
import CanvasObject from "./CanvasObject";
import SegmentationVisualization from "./SegmentationVisualization";
import Validation from "@/lib/validation/Validation";
import { Perf } from "r3f-perf";

function AppCanvasContent() {
  const [interaction] = useState(() => new Interaction());
  const objects = useObjectStore((state) => state.objects);

  return (
    <>
      {objects.map((object) => (
        <CanvasObject object={object} key={object.objectId} />
      ))}

      <SegmentationVisualization />

      <InteractionConnector interaction={interaction} />
      <KeyboardInteractionConnector />
    </>
  );
}

function AppCanvas() {
  const appStore = useAppStore();

  const keyboardMap = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.up, keys: ["Space"] },
      { name: Controls.down, keys: ["Shift"] },
      { name: Controls.rotateLeft, keys: ["KeyQ"] },
      { name: Controls.rotateRight, keys: ["KeyE"] },
    ],
    [],
  );

  if (!appStore.validation) {
    appStore.update({
      validation: new Validation(),
    });

    return <div>Lade...</div>;
  }

  return (
    <KeyboardControls map={keyboardMap}>
      <div className="h-screen w-screen">
        <Canvas>
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport
              axisColors={["red", "green", "blue"]}
              labelColor="black"
            />
            {/* alternative: <GizmoViewcube /> */}
          </GizmoHelper>
          <Perf
            customData={{
              value: 0,
              name: "Validation",
              round: 2,
              info: "ms",
            }}
          />

          {appStore.xrEnabled ? (
            <XR store={store}>
              <AppCanvasContent />
            </XR>
          ) : (
            <AppCanvasContent />
          )}
        </Canvas>
      </div>
    </KeyboardControls>
  );
}

export default AppCanvas;
