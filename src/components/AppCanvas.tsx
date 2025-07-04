import InteractionService from "@/lib/interaction/InteractionService";
import InteractionConnector from "@/lib/interaction/InteractionConnector";
import { store } from "@/lib/xr";
import { Canvas, useThree } from "@react-three/fiber";
import {
  GizmoHelper,
  GizmoViewport,
  KeyboardControls,
  type KeyboardControlsEntry,
} from "@react-three/drei";
import { XR, XRDomOverlay } from "@react-three/xr";
import { useEffect, useMemo, useState } from "react";
import { Controls } from "@/lib/types/interface";
import KeyboardInteractionConnector from "@/lib/interaction/KeyboardInteractionConnector";
import { useObjectStore } from "@/lib/stores/objectStore";
import CanvasObject from "./CanvasObject";
import SegmentationVisualization from "./SegmentationVisualization";
import { Perf } from "r3f-perf";
import { container } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import { IS_AR_ENABLED } from "@/lib/config/static";
import AddObjectModal from "./addModal/AddObjectModal";
import { useThreeStore } from "@/lib/stores/threeStore";
import CreativityLevel from "./CreativityLevel";
import { Portal, PortalContent } from "./Portal";

function AppCanvasContent() {
  const [interaction] = useState(() =>
    container.resolve<InteractionService>(TYPES.InteractionService)
  );
  const objects = useObjectStore((state) => state.objects);

  const three = useThree();
  const { update } = useThreeStore();
  useEffect(() => {
    update({ three });
  }, [three, update]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 100, 50]} intensity={0.8} castShadow />

      {objects.map((object) => (
        <CanvasObject object={object} key={object.id} />
      ))}

      {!IS_AR_ENABLED && <SegmentationVisualization />}

      <InteractionConnector interaction={interaction} />
      <KeyboardInteractionConnector />
    </>
  );
}

function AppCanvas() {
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
    []
  );
  const [isInAr, setIsInAr] = useState(false);

  return (
    <KeyboardControls map={keyboardMap}>
      <div className="h-screen w-screen">
        <Canvas
          camera={{
            rotation: [0, -Math.PI / 2, 0],
            position: [0, 1.6, 0],
          }}
        >
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
              // @ts-expect-error Types are wrong
              name: "Validation",
              round: 2,
              // @ts-expect-error Types are wrong
              info: "ms",
            }}
          />
          {IS_AR_ENABLED ? (
            <XR store={store}>
              <AppCanvasContent />

              <XRDomOverlay
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PortalContent />
              </XRDomOverlay>
            </XR>
          ) : (
            <>
              <AppCanvasContent />
            </>
          )}
        </Canvas>
      </div>

      {IS_AR_ENABLED ? (
        <>
          <div className="fixed bottom-0 left-0 w-screen p-3 bg-zinc-900/10">
            <button
              onClick={() => {
                store.enterAR();
                setIsInAr(true);
              }}
            >
              Enter AR
            </button>
          </div>

          <Portal>
            <AddObjectModal />
          </Portal>
        </>
      ) : (
        <div className="fixed top-0 left-0 w-screen h-screen pointer-events-none">
          <PortalContent />
        </div>
      )}

      {isInAr ? (
        <Portal>
          <AddObjectModal />
        </Portal>
      ) : (
        <AddObjectModal />
      )}
      <CreativityLevel />
    </KeyboardControls>
  );
}

export default AppCanvas;
